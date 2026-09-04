import { onAuthStateChanged, User } from 'firebase/auth';
import { useEffect, useState } from 'react';

import { auth } from '../services/firebase';

import { router } from 'expo-router';

import { ActivityIndicator, View } from 'react-native';

import { registrarNotificaciones } from '../services/notifications';


export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const [usuario, setUsuario] = useState<User | null>(null);
  const [cargando, setCargando] = useState(true);


  useEffect(() => {

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {

        setUsuario(user);
        setCargando(false);

      }
    );


    return unsubscribe;

  }, []);


  /**
   * Registra el dispositivo para recibir notificaciones
   * cuando existe un usuario autenticado.
   *
   * No modifica la información del pedido ni la navegación.
   */
  useEffect(() => {

    if (!usuario) {
      return;
    }

    console.log("NOTIFICACIONES: INICIANDO REGISTRO PARA USUARIO:", usuario.uid);
    registrarNotificaciones(usuario.uid);

  }, [usuario]);


  useEffect(() => {

    if (!cargando) {

      if (usuario) {
        router.replace('/(tabs)');
      }
      else {
        router.replace('/login');
      }

    }

  }, [usuario, cargando]);


  if (cargando) {

    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );

  }


  return children;

}

