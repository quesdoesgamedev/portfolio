let device, server, service, characteristic;

    const serviceUUID = '19b10000-e8f2-537e-4f6c-d104768a1214';
    const characteristicUUID = '19b10001-e8f2-537e-4f6c-d104768a1214';

    async function connect() {
      try {
        device = await navigator.bluetooth.requestDevice({
          filters: [{ name: 'Arduino' }, { name: 'SmartLock'}],
          optionalServices: [serviceUUID]
        });

        server = await device.gatt.connect();
        service = await server.getPrimaryService(serviceUUID);
        characteristic = await service.getCharacteristic(characteristicUUID);

        document.getElementById('status').innerText = 'Status: Connected ✅';

      } catch (error) {
        console.error(error);
        document.getElementById('status').innerText = 'Status: Failed to connect ❌';
      }
    }

    async function sendCommand(command) {
      if (!characteristic) {
        alert("Not connected to SmartLock");
        return;
      }
      const encoder = new TextEncoder();
      await characteristic.writeValue(encoder.encode(command));
      document.getElementById('status').innerText = `Sent: ${command}`;
    }