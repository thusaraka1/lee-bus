const int flexPins[] = {36, 34, 35, 32, 33, 27, 26, 25, 14, 4};
const int numSensors = 10;

void setup() {
  // Start serial communication at the same speed as your main project
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("--- Flex Sensor Raw Calibration Test ---");
  Serial.println("Format: P36, P34, P35, P32, P33, P27, P26, P25, P14, P4(D4)");

  // Initialize all pins as input
  for (int i = 0; i < numSensors; i++) {
    pinMode(flexPins[i], INPUT);
    // Note: ADC pins usually don't strictly require pinMode setting on ESP32, 
    // but it is good practice to ensure they are floating inputs.
  }
}

void loop() {
  Serial.print("RAW,");
  
  // Read and print the raw ADC value (0-4095) for every pin
  for (int i = 0; i < numSensors; i++) {
    int rawValue = analogRead(flexPins[i]);
    
    // Print the value
    Serial.print(rawValue);
    
    // Print a comma after all but the last value
    if (i < numSensors - 1) {
      Serial.print(",");
    }
  }
  
  Serial.println(); // Newline at the end
  delay(100);       // Wait 100ms before reading again
}
