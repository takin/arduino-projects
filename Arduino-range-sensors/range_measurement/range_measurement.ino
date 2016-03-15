#include <NewPing.h>

#define SENSOR_NUM 2
#define MAX_DISTANCE 200
#define PING_INTERVAL 33

unsigned long pingTimer[SENSOR_NUM];
unsigned int distance[SENSOR_NUM];
uint8_t currentSensor = 0;

NewPing sonar[SENSOR_NUM] = {
  NewPing(4,5,MAX_DISTANCE),
  NewPing(6,7,MAX_DISTANCE)
};

void setup() {
  Serial.begin(115200);
  pingTimer[0] = millis() + 75;
  for(uint8_t i = 1; i < SENSOR_NUM; i++) {
    pingTimer[i] = pingTimer[i - 1] + PING_INTERVAL;
  }
}

void loop() {
  for (uint8_t i = 0; i < SENSOR_NUM; i++) {
    if ( millis() >= pingTimer[i]) {
      pingTimer[i] += PING_INTERVAL * SENSOR_NUM;
      
      if ( i == 0 && currentSensor == SENSOR_NUM - 1 ) {
        reportMeasurement();
      }
      
      sonar[currentSensor].timer_stop();
      currentSensor = i;
      distance[currentSensor] = 0;
      sonar[currentSensor].ping_timer(echoCheck);
      
    }
  }
}

void echoCheck() {
  if ( sonar[currentSensor].check_timer() ) {
    distance[currentSensor] = sonar[currentSensor].ping_result / US_ROUNDTRIP_CM;
  }
}

void reportMeasurement() {
  for ( uint8_t i = 0; i < SENSOR_NUM; i++ ) {
    Serial.print("Bin 1x" + (i + 1));
    Serial.print("Distance = " + distance[i]);
  }
  
  Serial.println();
}
