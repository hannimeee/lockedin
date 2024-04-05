import mysql.connector

# Connect to the database
connection = mysql.connector.connect(
    host="your_host",
    user="your_username",
    password="your_password",
    database="your_database"
)

# Create a cursor object to execute queries
cursor = connection.cursor()

# Execute a query
cursor.execute("SELECT * FROM your_table")

# Fetch the results
results = cursor.fetchall()
for row in results:
    print(row)

# Close the cursor and connection
cursor.close()
connection.close()
