import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Image } from 'react-native';
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
      <Image source={require('./images/imagen_fondo..jpg')} style={styles.fondo} />
      <View style={styles.logoContainer}>
        <Image source={require('./images/qr_logo_Mesa de trabajo 1.png')} style={styles.logo} />
      </View>
      <View style={styles.scannerContainer}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={styles.barcodeScanner}
        />
      </View>
      <View style={styles.dataContainer}>
        {scanned && (
          <View style={styles.overlay}>
            <Text style={styles.scanMessage}>{scannedData}</Text>
          </View>
        )}
        <View style={[styles.scanAgainContainer, scanned && styles.scanAgainContainerScanned]}>
          <View style={styles.scanAgainButtonContainer}>
            <Button title="Escanear de Nuevo" onPress={handleScanAgain} />
          </View>
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
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40, // Aumenta el margen superior para bajar la imagen
  },
  logo: {
    width: 200,  // ANCHO DE LA IMAGEN
    height: 170, // ALTO DE LA IMAGEN
    resizeMode: 'contain',
  },
  scannerContainer: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20, // REDUCIR LOS MARGENES
  },
  barcodeScanner: {
    width: '90%',
    height: '90%',
  },
  dataContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(255, 255,255,0.5)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scanMessage: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  scanAgainContainer: {
    alignItems: 'center',
    marginTop: '5%',
  },
  scanAgainContainerScanned: {
    marginTop: -7,
  },
  scanAgainButtonContainer: {
    borderRadius: 80,
    padding: 20
  },
  fondo:{
    height: 920,
    width: '100%',
   position: 'absolute',
  },
});

export default QRScannerApp;
