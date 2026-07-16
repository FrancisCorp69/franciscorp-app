import { Redirect } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { auth } from '../services/firebase';

export default function Index() {
  const [cargando, setCargando] = useState(true);
  const [usuario, setUsuario] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      setCargando(false);
    });

    return unsubscribe;
  }, []);

  if (cargando) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#ffffff',
        }}
      >
        <ActivityIndicator size="large" color="#208AEF" />
      </View>
    );
  }

  return usuario ? (
    <Redirect href="/(tabs)" />
  ) : (
    <Redirect href="/login" />
  );
}