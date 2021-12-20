from pymongo import MongoClient
import pymongo


def get_database():
    # connection URL settings
    CONNECTION_STRING = "mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false"
    client = MongoClient(CONNECTION_STRING)
    return client['edge_data']
