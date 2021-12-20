from socket import *
from database import get_database
import json
import datetime
"""
IPアドレスの確認方法
コマンドプロンプトで「ipconfig」と入力し
と入力し、
［IPv4 アドレス］または［IPアドレス］の値が、使用しているパソコンのIPアドレスです。
"""

print("start network")
addr = ("", 50007)  # 192.168.0.9

db = get_database()
collection_MPU6886 = db["MPU6886"]
collection_ENV3 = db["ENV3"]
collection_GPS = db["GPS"]

print("network setup started")
UDPSock = socket(AF_INET, SOCK_DGRAM)
UDPSock.settimeout(0.0001)
print("Connected !!")
print("Network info -->" + str(addr))
UDPSock.bind(addr)

print("setup finished")

while True:
    try:
        (data, addr) = UDPSock.recvfrom(1024)
    except timeout:
        continue

    if addr != 0:
        str_data = data.decode('utf-8')
        # 現在時刻を取得
        dt_now = datetime.datetime.now()
        json_data = json.loads(str_data)
        # 6軸データ
        MPU6886 = json_data['MPU6886']
        MPU6886['created_at'] = dt_now
        # ENV3のデータ
        ENV3 = json_data['ENVIII']
        ENV3['created_at'] = dt_now
        # GPSのデータ
        GPS = json_data['GPS']
        GPS['created_at'] = dt_now
        # print(f"get message from {addr} --> {str_data}")
        collection_MPU6886.insert_one(MPU6886)
        collection_ENV3.insert_one(ENV3)
        collection_GPS.insert_one(GPS)
print("end!")
