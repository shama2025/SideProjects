import sqlite3
import datetime
import json

def create_con():
    return sqlite3.connect("computer_stats.db")

def create_table():
    con = create_con()
    con.cursor()
    con.execute("""CREATE TABLE IF NOT EXISTS system_stats(
                date text,
                cpu_metrics text,
                mac_os_metrics text,
                linux_metrics text,
                swap_metrics text,
                process_metrics text
                )""")
    con.commit()
    con.close()

def write_to_table(stats):
    con = create_con()
    date = datetime.datetime.now()
    cpu_metrics = json.dumps(stats['cpu_metrics'])
    mac_os_metrics = json.dumps(stats['mac_os_specific_metrics'])
    linux_metrics = json.dumps(stats['linux_specific_metrics'])
    swap_metrics = json.dumps(stats['swap_metrics'])
    process_metrics = json.dumps(stats['process_metrics'])
    cursor = con.cursor()
    cursor.execute("INSERT INTO system_stats(date,cpu_metrics,mac_os_metrics,linux_metrics,swap_metrics,process_metrics) VALUES(?,?,?,?,?,?)",(date,cpu_metrics,mac_os_metrics,linux_metrics,swap_metrics,process_metrics))
    con.commit()
    cursor.close()
    con.close()

def fetch_from_table():
    con = create_con()
    cursor = con.cursor()
    res = cursor.execute("""SELECT * FROM system_stats""").fetchmany()
    cursor.close()
    con.close()
    return res

create_table()