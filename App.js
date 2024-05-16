import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, FlatList } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';

const QRScannerApp = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [dataItems, setDataItems] = useState([]);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    setScannedData(data);
    const decodedData = decodeURIComponent(data);
    const dataArray = decodedData.split('\n');
    const nombre = dataArray[0].split(':')[1].trim();
    const correo = dataArray[1].split(':')[1].trim();
    const empresa = dataArray[2].split(':')[1].trim();
    const userData = { nombre, correo, empresa };
    setDataItems(prevData => [...prevData, userData]);
    await saveDataToServer(userData);
  };

  const saveDataToServer = async (data) => {
    try {
      const response = await fetch('http://192.168.15.136:8080/registrodialogosciudadanos2024/asistencia.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `nombre=${encodeURIComponent(data.nombre)}&correo=${encodeURIComponent(data.correo)}&empresa=${encodeURIComponent(data.empresa)}`
      });
      if (!response.ok) {
        throw new Error('Error al guardar datos en el servidor');
      }
      const responseData = await response.text();
      alert(responseData);
    } catch (error) {
      console.error(error);
      alert('Error al conectar con el servidor');
    }
  };

  const handleSaveData = () => {
    alert('Datos guardados localmente');
  };

  const handleClearTable = () => {
    setDataItems([]);
  };

  const handleScanAgain = () => {
    setScanned(false);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Esperando permiso de la cámara...</Text>
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>No se tuvo acceso a la cámara.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.scannerContainer}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={styles.barcodeScanner}
        />
      </View>

      <View style={styles.dataContainer}>
        {scanned && (
          <View style={styles.overlay}>
            <Text style={styles.scanMessage}>Escaneado: {scannedData}</Text>
            
            <FlatList
              style={styles.dataList}
              data={dataItems}
              renderItem={({ item }) => (
                <View>
                  <Text style={styles.dataItem}>Nombre: {item.nombre}</Text>
                  <Text style={styles.dataItem}>Correo: {item.correo}</Text>
                  <Text style={styles.dataItem}>Empresa: {item.empresa}</Text>
                </View>
              )}
              keyExtractor={(item, index) => index.toString()}
            />

            <View style={styles.buttonsContainer}>
              <Button title="Guardar Datos" onPress={handleSaveData} color="#1B512D" />
              <Button title="Borrar Tabla" onPress={handleClearTable} color="red" />
            </View>
          </View>
        )}
        <View style={styles.scanAgainContainer}>
          <Button title="Escanear de Nuevo" onPress={handleScanAgain} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  scannerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barcodeScanner: {
    width: 350,
    height: 300,
    backgroundColor: '#fff'
  },
  dataContainer: {
    flex: 1,
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanMessage: {
    fontSize: 10,
    marginBottom: 15,
  },
  dataList: {
    marginTop: 20,
    width: '100%',
    backgroundColor: '#fff'
  },
  dataItem: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#090809',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    width: '100%',
    marginTop: 20
  },
  scanAgainContainer: {
    alignItems: 'center',
    marginTop: 20,
  }
});

export default QRScannerApp;
