import serial
import time
import csv
import sys

port = "COM4"
baud = 115200
samples = 100

try:
    ser = serial.Serial(port, baud, timeout=1)
except Exception as e:
    print(f"Error opening serial port: {e}")
    sys.exit(1)

print(f"Reading {samples} lines from {port}...")

readings = []
start_time = time.time()
while len(readings) < samples and (time.time() - start_time) < 15:
    line = ser.readline().decode('utf-8', errors='ignore').strip()
    if line.startswith("DATA,"):
        parts = line.split(",")
        if len(parts) >= 11:
            # parts[10] would be the 10th sensor which corresponds to P4
            try:
                val1 = float(parts[1])
                val2 = float(parts[2])
                val3 = float(parts[3])
                val4 = float(parts[4])
                val5 = float(parts[5])
                val6 = float(parts[6])
                val7 = float(parts[7])
                val8 = float(parts[8])
                val9 = float(parts[9])
                val10 = float(parts[10])
                readings.append([val1, val2, val3, val4, val5, val6, val7, val8, val9, val10])
            except ValueError:
                pass # nan might cause issues if not handled, float('nan') works in python though

ser.close()

with open("d4_readings.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["P36","P34","P35","P32","P33","P27","P26","P25","P14","P4"])
    writer.writerows(readings)

print(f"Saved {len(readings)} readings. D4 (P4) unique values: {set([r[9] for r in readings])}")
