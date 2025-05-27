import React, { useState } from "react";

const SERVICE_UUID_A = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const CHARACTERISTIC_UUID_A = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";
const SERVICE_UUID_B = "12345678-1234-5678-1234-56789abcdef0";
const CHARACTERISTIC_UUID_B = "abcdefab-cdef-1234-5678-abcdefabcdef";

const BLEDeviceConnector = ({ motionType, onAngleUpdate, onDistanceUpdate }) => {
  const [statusA, setStatusA] = useState("Not connected");
  const [statusB, setStatusB] = useState("Not connected");
  const [angle, setAngle] = useState("--");
  const [distance, setDistance] = useState("--");

  const connectDeviceA = async () => {
    try {
      setStatusA("Connecting...");
      let device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: "DeviceA" }],
        optionalServices: [SERVICE_UUID_A]
      });
      let server = await device.gatt.connect();
      let service = await server.getPrimaryService(SERVICE_UUID_A);
      let characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID_A);
      await characteristic.startNotifications();
      characteristic.addEventListener("characteristicvaluechanged", (event) => {
        const value = event.target.value;
        const angleValue = parseInt(new TextDecoder().decode(value));
        setAngle(angleValue);
        if (onAngleUpdate) onAngleUpdate(angleValue);
      });
      setStatusA("Connected to Device A");
    } catch (e) {
      setStatusA("Connection failed: " + e.message);
    }
  };

  const connectDeviceB = async () => {
    try {
      setStatusB("Connecting...");
      let device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: "DeviceB" }],
        optionalServices: [SERVICE_UUID_B]
      });
      let server = await device.gatt.connect();
      let service = await server.getPrimaryService(SERVICE_UUID_B);
      let characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID_B);
      await characteristic.startNotifications();
      characteristic.addEventListener("characteristicvaluechanged", (event) => {
        const value = event.target.value;
        const distanceValue = parseInt(new TextDecoder().decode(value));
        setDistance(distanceValue);
        if (onDistanceUpdate) onDistanceUpdate(distanceValue);
      });
      setStatusB("Connected to Device B");
    } catch (e) {
      setStatusB("Connection failed: " + e.message);
    }
  };

  if (motionType === "Hip Flexion") {
    return (
      <div style={{ margin: "12px 0" }}>
        <button onClick={connectDeviceA}>Connect Device A (Angle Sensor)</button>
        <div>Status: {statusA}</div>
        <div>Angle: {angle}</div>
        <button onClick={connectDeviceB} style={{ marginLeft: 16 }}>Connect Device B (Distance Sensor)</button>
        <div>Status: {statusB}</div>
        <div>Height: {distance}</div>
      </div>
    );
  }

  if (motionType === "Heel Raise") {
    return (
      <div style={{ margin: "12px 0" }}>
        <button onClick={connectDeviceB}>Connect Device B (Distance Sensor)</button>
        <div>Status: {statusB}</div>
        <div>Height: {distance}</div>
      </div>
    );
  }

  return (
    <div style={{ margin: "12px 0" }}>
      <button onClick={connectDeviceA}>
        {motionType === "Hamstring Curl" ? "Connect Device A (Angle Sensor)" : "Connect BLE Device"}
      </button>
      <div>Status: {statusA}</div>
      {motionType === "Hamstring Curl" && <div>Angle: {angle}</div>}
    </div>
  );
};

export default BLEDeviceConnector; 