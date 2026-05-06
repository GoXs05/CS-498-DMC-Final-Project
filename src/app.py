from collections import defaultdict
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from cassandra.cluster import Cluster
from pyspark.sql import SparkSession

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CASSANDRA_HOST = "34.55.126.122"
KEYSPACE = "atmospheric_data"

cluster = Cluster([CASSANDRA_HOST], port=9042)
session = cluster.connect(KEYSPACE)

VARIABLE_MAP = {
    "UV BED": "uv_biologically_effective_dose_surface",
    "Ozone (O3)": "gems_total_column_ozone_surface",
    "Carbon Monoxide (CO)": "total_column_carbon_monoxide_surface",
    "Nitrogen Dioxide (NO2)": "total_column_nitrogen_dioxide_surface",
}

DISPLAY_NAMES = {
    "uv_biologically_effective_dose_surface": "UV BED",
    "gems_total_column_ozone_surface": "Ozone (O3)",
    "total_column_carbon_monoxide_surface": "Carbon Monoxide (CO)",
    "total_column_nitrogen_dioxide_surface": "Nitrogen Dioxide (NO2)",
}


spark = (
    SparkSession.builder
    .appName("AtmosphericAnalyticsAPI")
    .config("spark.jars.packages", "com.datastax.spark:spark-cassandra-connector_2.12:3.5.1")
    .config("spark.cassandra.connection.host", CASSANDRA_HOST)
    .config("spark.cassandra.connection.port", "9042")
    .getOrCreate()
)

atmospheric_df = (
    spark.read
    .format("org.apache.spark.sql.cassandra")
    .options(table="atmospheric_measurements", keyspace=KEYSPACE)
    .load()
)

population_df = (
    spark.read
    .format("org.apache.spark.sql.cassandra")
    .options(table="county_population", keyspace=KEYSPACE)
    .load()
)

atmospheric_df.createOrReplaceTempView("atmospheric_measurements")
population_df.createOrReplaceTempView("county_population")


@app.get("/api/heatmap")
def get_heatmap(variable: str = "UV BED"):
    cassandra_var = VARIABLE_MAP.get(variable, variable)

    result = spark.sql(f"""
        SELECT county, AVG(value) AS avg_value
        FROM atmospheric_measurements
        WHERE variable = '{cassandra_var}'
        GROUP BY county
    """)

    return {
        row["county"]: float(row["avg_value"])
        for row in result.collect()
    }


@app.get("/api/county/{county}")
def get_county_stats(county: str):
    county_safe = county.replace("'", "''")

    population_result = spark.sql(f"""
        SELECT population
        FROM county_population
        WHERE county = '{county_safe}'
        LIMIT 1
    """).collect()

    population = int(population_result[0]["population"]) if population_result else 0

    trend_rows = spark.sql(f"""
        WITH monthly AS (
            SELECT
                variable,
                date_format(measurement_date, 'yyyy-MM') AS month,
                AVG(value) AS avg_value
            FROM atmospheric_measurements
            WHERE county = '{county_safe}'
            GROUP BY variable, date_format(measurement_date, 'yyyy-MM')
        ),
        ranked AS (
            SELECT
                variable,
                month,
                avg_value,
                ROW_NUMBER() OVER (
                    PARTITION BY variable
                    ORDER BY month DESC
                ) AS rn
            FROM monthly
        )
        SELECT variable, month, avg_value
        FROM ranked
        WHERE rn <= 3
        ORDER BY variable, month ASC
    """).collect()

    grouped = {}
    for row in trend_rows:
        variable = row["variable"]
        grouped.setdefault(variable, []).append(float(row["avg_value"]))

    trends = []
    for variable, values in grouped.items():
        while len(values) < 3:
            values.insert(0, 0)

        trends.append({
            "variable": DISPLAY_NAMES.get(variable, variable),
            "threeMonthValues": values,
        })

    return {
        "name": county,
        "population": population,
        "trends": trends,
    }


@app.get("/api/statewide")
def get_statewide():
    uv_var = "uv_biologically_effective_dose_surface"
    ozone_var = "gems_total_column_ozone_surface"

    uv_highest = spark.sql(f"""
        SELECT county, AVG(value) AS value
        FROM atmospheric_measurements
        WHERE variable = '{uv_var}'
        AND date_format(measurement_date, 'yyyy-MM') = '2024-08'
        GROUP BY county
        ORDER BY value DESC
        LIMIT 3
    """).collect()

    uv_lowest = spark.sql(f"""
        SELECT county, AVG(value) AS value
        FROM atmospheric_measurements
        WHERE variable = '{uv_var}'
        AND date_format(measurement_date, 'yyyy-MM') = '2024-08'
        GROUP BY county
        ORDER BY value ASC
        LIMIT 3
    """).collect()

    highest_ozone = spark.sql(f"""
        SELECT county, AVG(value) AS value
        FROM atmospheric_measurements
        WHERE variable = '{ozone_var}'
        GROUP BY county
        ORDER BY value DESC
        LIMIT 5
    """).collect()


    most_drastic_uv = spark.sql(f"""
        WITH monthly AS (
            SELECT
                county,
                date_format(measurement_date, 'yyyy-MM') AS month,
                AVG(value) AS avg_value
            FROM atmospheric_measurements
            WHERE variable = '{uv_var}'
            GROUP BY county, date_format(measurement_date, 'yyyy-MM')
        ),
        indexed AS (
            SELECT
                county,
                avg_value,
                ROW_NUMBER() OVER (PARTITION BY county ORDER BY month ASC) - 1 AS month_index
            FROM monthly
        )
        SELECT
            county,
            regr_slope(avg_value, month_index) AS rate
        FROM indexed
        GROUP BY county
        ORDER BY ABS(rate) DESC
        LIMIT 6
    """).collect()

    urban_rural = spark.sql(f"""
        WITH county_avgs AS (
            SELECT
                a.county,
                p.population,
                AVG(CASE WHEN a.variable = '{ozone_var}' THEN a.value END) AS avg_ozone,
                AVG(CASE WHEN a.variable = '{uv_var}' THEN a.value END) AS avg_uv
            FROM atmospheric_measurements a
            JOIN county_population p
            ON a.county = p.county
            GROUP BY a.county, p.population
        )
        SELECT
            CASE WHEN population >= 250000 THEN 'urban' ELSE 'rural' END AS region_type,
            AVG(avg_ozone) AS avgOzone,
            AVG(avg_uv) AS avgUvBed
        FROM county_avgs
        GROUP BY CASE WHEN population >= 250000 THEN 'urban' ELSE 'rural' END
    """).collect()

    urban_rural_summary = {
        "urban": {"avgOzone": 0, "avgUvBed": 0},
        "rural": {"avgOzone": 0, "avgUvBed": 0},
    }

    for row in urban_rural:
        urban_rural_summary[row["region_type"]] = {
            "avgOzone": float(row["avgOzone"] or 0),
            "avgUvBed": float(row["avgUvBed"] or 0),
        }

    return {
        "uvBedExtremes": {
            "highest": [{"county": r["county"], "value": float(r["value"])} for r in uv_highest],
            "lowest": [{"county": r["county"], "value": float(r["value"])} for r in uv_lowest],
        },
        "highestAvgOzone": [{"county": r["county"], "value": float(r["value"])} for r in highest_ozone],
        "mostDrasticUvTrends": [{"county": r["county"], "rate": float(r["rate"])} for r in most_drastic_uv],
        "urbanRuralSummary": urban_rural_summary,
        "urbanRuralThreshold": 250000,
    }
