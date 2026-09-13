import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../services/firebase";

type TipoOferta = "productos" | "servicios" | "ambos";

type DiaHorario = {
  dia: string;
  abierto: boolean;
  apertura: string;
  cierre: string;
};

const HORARIOS_INICIALES: DiaHorario[] = [
  { dia: "Lunes", abierto: true, apertura: "09:00", cierre: "20:00" },
  { dia: "Martes", abierto: true, apertura: "09:00", cierre: "20:00" },
  { dia: "Mi�rcoles", abierto: true, apertura: "09:00", cierre: "20:00" },
  { dia: "Jueves", abierto: true, apertura: "09:00", cierre: "20:00" },
  { dia: "Viernes", abierto: true, apertura: "09:00", cierre: "20:00" },
  { dia: "S�bado", abierto: true, apertura: "09:00", cierre: "20:00" },
  { dia: "Domingo", abierto: false, apertura: "09:00", cierre: "20:00" },
];

const nombresTipo: Record<string, string> = {
  restaurante: "Restaurante",
  tienda: "Tienda",
  farmacia: "Farmacia",
  servicios: "Servicios",
  transporte: "Transporte",
  empresa: "Empresa",
  profesional: "Profesional",
  otro: "Otro",
};

const categoriasRestaurante = [
  "Ecuatoriana",
  "China",
  "Mexicana",
  "Italiana",
  "Japonesa",
  "Peruana",
  "Colombiana",
  "Comida r�pida",
  "Parrillada",
  "Mariscos",
  "Cafeter�a",
  "Panader�a",
  "Pasteler�a",
  "Postres",
  "Bebidas",
  "Otra",
];

const categoriasTienda = [
  "Minimarket",
  "Supermercado",
  "Ropa",
  "Calzado",
  "Tecnolog�a",
  "Hogar",
  "Ferreter�a",
  "Mascotas",
  "Papeler�a",
  "Regalos",
  "Belleza",
  "Electr�nica",
  "Otra",
];

const categoriasFarmacia = [
  "Farmacia",
  "Cuidado personal",
  "Higiene",
  "Vitaminas",
  "Primeros auxilios",
  "Beb�s",
  "Higiene bucal",
  "Dermocosm�tica",
  "Dispositivos m�dicos",
  "Otra",
];

const categoriasServicios = [
  "Electricidad",
  "Plomer�a",
  "Limpieza",
  "Reparaciones",
  "Construcci�n",
  "Dise�o",
  "Programaci�n",
  "Marketing",
  "Contabilidad",
  "Asesor�a",
  "Fotograf�a",
  "Eventos",
  "Belleza",
  "Educaci�n",
  "Transporte",
  "Servicios profesionales",
  "Otra",
];

const categoriasTransporte = [
  "Pasajeros",
  "Carga",
  "Mensajer�a",
  "Transporte empresarial",
  "Mudanzas",
  "Otro",
];

const categoriasProfesional = [
  "Abogado",
  "Contador",
  "Arquitecto",
  "Ingeniero",
  "Dise�ador",
  "Programador",
  "Fot�grafo",
  "Profesor",
  "Consultor",
  "Asesor",
  "Otro",
];

export default function CrearNegocioScreen() {
  const params = useLocalSearchParams();

  const tipo = String(params.tipo || "otro");
  const tipoNombre = String(
    params.nombreTipo || nombresTipo[tipo] || "Negocio",
  );

  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [telefono, setTelefono] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [correo, setCorreo] = useState("");
  const [redesSociales, setRedesSociales] = useState("");
  const [paginaWeb, setPaginaWeb] = useState("");

  const [direccion, setDireccion] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [provincia, setProvincia] = useState("");
  const [referencia, setReferencia] = useState("");
  const [zonaCobertura, setZonaCobertura] = useState("");

  const [horarios, setHorarios] = useState<DiaHorario[]>(HORARIOS_INICIALES);

  const [tipoOferta, setTipoOferta] = useState<TipoOferta | null>(null);

  const [tipoComida, setTipoComida] = useState("");
  const [modalidadRestaurante, setModalidadRestaurante] = useState("");

  const [tipoTienda, setTipoTienda] = useState("");
  const [marcas, setMarcas] = useState("");

  const [farmaceutico, setFarmaceutico] = useState("");
  const [informacionLegal, setInformacionLegal] = useState("");

  const [categoriaServicio, setCategoriaServicio] = useState("");

  const [tipoTransporte, setTipoTransporte] = useState("");
  const [tipoVehiculo, setTipoVehiculo] = useState("");
  const [marcaVehiculo, setMarcaVehiculo] = useState("");
  const [modeloVehiculo, setModeloVehiculo] = useState("");
  const [anioVehiculo, setAnioVehiculo] = useState("");
  const [colorVehiculo, setColorVehiculo] = useState("");
  const [capacidadVehiculo, setCapacidadVehiculo] = useState("");
  const [placaVehiculo, setPlacaVehiculo] = useState("");
  const [precioBase, setPrecioBase] = useState("");
  const [precioKilometro, setPrecioKilometro] = useState("");

  const [razonSocial, setRazonSocial] = useState("");
  const [ruc, setRuc] = useState("");
  const [sector, setSector] = useState("");

  const [profesion, setProfesion] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [experiencia, setExperiencia] = useState("");
  const [certificaciones, setCertificaciones] = useState("");
  const [modalidadProfesional, setModalidadProfesional] = useState("");

  const [otroTipo, setOtroTipo] = useState("");

  const [mostrarVistaPrevia, setMostrarVistaPrevia] = useState(false);

  const categorias = useMemo(() => {
    switch (tipo) {
      case "restaurante":
        return categoriasRestaurante;
      case "tienda":
        return categoriasTienda;
      case "farmacia":
        return categoriasFarmacia;
      case "servicios":
        return categoriasServicios;
      case "transporte":
        return categoriasTransporte;
      case "profesional":
        return categoriasProfesional;
      default:
        return [];
    }
  }, [tipo]);

  const actualizarHorario = (
    indice: number,
    campo: keyof DiaHorario,
    valor: string | boolean,
  ) => {
    setHorarios((actuales) =>
      actuales.map((horario, i) =>
        i === indice ? { ...horario, [campo]: valor } : horario,
      ),
    );
  };

  const validarFormulario = () => {
    if (!nombre.trim()) {
      Alert.alert("Falta informaci�n", "Ingresa el nombre del negocio.");
      return false;
    }

    if (!categoria.trim() && tipo !== "otro") {
      Alert.alert("Falta informaci�n", "Ingresa o selecciona una categor�a.");
      return false;
    }

    if (!descripcion.trim()) {
      Alert.alert("Falta informaci�n", "Agrega una descripci�n del negocio.");
      return false;
    }

    if (!direccion.trim()) {
      Alert.alert("Falta informaci�n", "Ingresa la direcci�n.");
      return false;
    }

    if (!ciudad.trim()) {
      Alert.alert("Falta informaci�n", "Ingresa la ciudad.");
      return false;
    }

    if (!tipoOferta) {
      Alert.alert(
        "Falta informaci�n",
        "Selecciona si ofrecer�s productos, servicios o ambos.",
      );
      return false;
    }

    if (tipo === "otro" && !otroTipo.trim()) {
      Alert.alert("Falta informaci�n", "Indica qu� tipo de negocio tienes.");
      return false;
    }

    return true;
  };

  const continuar = () => {
    if (!validarFormulario()) {
      return;
    }

    setMostrarVistaPrevia(true);
  };

  const crearNegocio = async () => {
    if (!validarFormulario()) {
      return;
    }

    try {
      const usuario = auth.currentUser;

      if (!usuario) {
        Alert.alert(
          "Sesión requerida",
          "Debes iniciar sesión para crear un negocio.",
        );
        return;
      }

      const negocio = {
        propietarioId: usuario.uid,

        nombre: nombre.trim(),
        tipo,
        tipoNombre,
        categoria: categoria.trim(),
        descripcion: descripcion.trim(),

        contacto: {
          telefono: telefono.trim(),
          whatsapp: whatsapp.trim(),
          correo: correo.trim(),
          redesSociales: redesSociales.trim(),
          paginaWeb: paginaWeb.trim(),
        },

        ubicacion: {
          direccion: direccion.trim(),
          ciudad: ciudad.trim(),
          provincia: provincia.trim(),
          referencia: referencia.trim(),
          zonaCobertura: zonaCobertura.trim(),
        },

        horarios,

        oferta: {
          tipo: tipoOferta,
        },

        datosEspecificos: {
          tipoComida: tipoComida.trim(),
          modalidadRestaurante: modalidadRestaurante.trim(),

          tipoTienda: tipoTienda.trim(),
          marcas: marcas.trim(),

          farmaceutico: farmaceutico.trim(),
          informacionLegal: informacionLegal.trim(),

          categoriaServicio: categoriaServicio.trim(),

          tipoTransporte: tipoTransporte.trim(),
          tipoVehiculo: tipoVehiculo.trim(),
          marcaVehiculo: marcaVehiculo.trim(),
          modeloVehiculo: modeloVehiculo.trim(),
          anioVehiculo: anioVehiculo.trim(),
          colorVehiculo: colorVehiculo.trim(),
          capacidadVehiculo: capacidadVehiculo.trim(),
          placaVehiculo: placaVehiculo.trim(),
          precioBase: precioBase.trim(),
          precioKilometro: precioKilometro.trim(),

          razonSocial: razonSocial.trim(),
          ruc: ruc.trim(),
          sector: sector.trim(),

          profesion: profesion.trim(),
          especialidad: especialidad.trim(),
          experiencia: experiencia.trim(),
          certificaciones: certificaciones.trim(),
          modalidadProfesional: modalidadProfesional.trim(),

          otroTipo: otroTipo.trim(),
        },

        estado: "activo",
        creadoEn: serverTimestamp(),
        actualizadoEn: serverTimestamp(),
      };

      const referenciaNegocio = await addDoc(
        collection(db, "negocios"),
        negocio,
      );

      console.log("NEGOCIO CREADO:", referenciaNegocio.id);

      Alert.alert(
        "¡Negocio creado!",
        "Tu negocio se ha registrado correctamente en FrancisCorp.",
        [
          {
            text: "Aceptar",
            onPress: () => router.back(),
          },
        ],
      );
    } catch (error) {
      console.error("ERROR AL CREAR NEGOCIO:", error);

      Alert.alert(
        "Error",
        "No pudimos crear el negocio. Revisa tu conexión e inténtalo nuevamente.",
      );
    }
  };

  const renderCategoria = () => {
    if (tipo === "otro") {
      return (
        <>
          <Text style={styles.label}>Tipo de negocio *</Text>

          <TextInput
            style={styles.input}
            value={otroTipo}
            onChangeText={setOtroTipo}
            placeholder="Ej. Florister�a"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Categor�a</Text>

          <TextInput
            style={styles.input}
            value={categoria}
            onChangeText={setCategoria}
            placeholder="Ej. Flores y regalos"
            placeholderTextColor="#999"
          />
        </>
      );
    }

    return (
      <>
        <Text style={styles.label}>Categor�a *</Text>

        <View style={styles.chipsContainer}>
          {categorias.map((item) => {
            const activo = categoria === item;

            return (
              <Pressable
                key={item}
                style={[styles.chip, activo && styles.chipActivo]}
                onPress={() => setCategoria(item)}
              >
                <Text
                  style={[styles.chipTexto, activo && styles.chipTextoActivo]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </>
    );
  };

  const renderOferta = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>�Qu� quieres ofrecer?</Text>

      <Pressable
        style={[
          styles.option,
          tipoOferta === "productos" && styles.optionActivo,
        ]}
        onPress={() => setTipoOferta("productos")}
      >
        <MaterialCommunityIcons
          name="shopping-outline"
          size={27}
          color="#0066CC"
        />

        <View style={styles.optionText}>
          <Text style={styles.optionTitle}>Productos</Text>

          <Text style={styles.optionDescription}>
            Vender productos a los clientes.
          </Text>
        </View>

        {tipoOferta === "productos" && (
          <MaterialCommunityIcons
            name="check-circle"
            size={25}
            color="#F2B705"
          />
        )}
      </Pressable>

      <Pressable
        style={[
          styles.option,
          tipoOferta === "servicios" && styles.optionActivo,
        ]}
        onPress={() => setTipoOferta("servicios")}
      >
        <MaterialCommunityIcons
          name="briefcase-outline"
          size={27}
          color="#0066CC"
        />

        <View style={styles.optionText}>
          <Text style={styles.optionTitle}>Servicios</Text>

          <Text style={styles.optionDescription}>
            Ofrecer servicios profesionales o especializados.
          </Text>
        </View>

        {tipoOferta === "servicios" && (
          <MaterialCommunityIcons
            name="check-circle"
            size={25}
            color="#F2B705"
          />
        )}
      </Pressable>

      <Pressable
        style={[styles.option, tipoOferta === "ambos" && styles.optionActivo]}
        onPress={() => setTipoOferta("ambos")}
      >
        <MaterialCommunityIcons
          name="storefront-outline"
          size={27}
          color="#0066CC"
        />

        <View style={styles.optionText}>
          <Text style={styles.optionTitle}>Productos y servicios</Text>

          <Text style={styles.optionDescription}>
            Ofrecer ambos dentro del mismo negocio.
          </Text>
        </View>

        {tipoOferta === "ambos" && (
          <MaterialCommunityIcons
            name="check-circle"
            size={25}
            color="#F2B705"
          />
        )}
      </Pressable>
    </View>
  );

  const renderEspecialidad = () => {
    switch (tipo) {
      case "restaurante":
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informaci�n gastron�mica</Text>

            <Text style={styles.label}>Tipo de comida</Text>

            <TextInput
              style={styles.input}
              value={tipoComida}
              onChangeText={setTipoComida}
              placeholder="Ej. Comida ecuatoriana"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Modalidad</Text>

            <TextInput
              style={styles.input}
              value={modalidadRestaurante}
              onChangeText={setModalidadRestaurante}
              placeholder="Ej. Local, para llevar y delivery"
              placeholderTextColor="#999"
            />
          </View>
        );

      case "tienda":
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informaci�n de la tienda</Text>

            <Text style={styles.label}>Tipo de tienda</Text>

            <TextInput
              style={styles.input}
              value={tipoTienda}
              onChangeText={setTipoTienda}
              placeholder="Ej. Minimarket"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Marcas que comercializas</Text>

            <TextInput
              style={styles.input}
              value={marcas}
              onChangeText={setMarcas}
              placeholder="Ej. Coca-Cola, Nestl�..."
              placeholderTextColor="#999"
            />
          </View>
        );

      case "farmacia":
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informaci�n de farmacia</Text>

            <Text style={styles.label}>Farmac�utico responsable</Text>

            <TextInput
              style={styles.input}
              value={farmaceutico}
              onChangeText={setFarmaceutico}
              placeholder="Nombre del responsable"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Informaci�n adicional</Text>

            <TextInput
              style={[styles.input, styles.textArea]}
              value={informacionLegal}
              onChangeText={setInformacionLegal}
              placeholder="Informaci�n que consideres necesaria"
              placeholderTextColor="#999"
              multiline
            />
          </View>
        );

      case "servicios":
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informaci�n del servicio</Text>

            <Text style={styles.label}>Especialidad del servicio</Text>

            <TextInput
              style={styles.input}
              value={categoriaServicio}
              onChangeText={setCategoriaServicio}
              placeholder="Ej. Limpieza profesional"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Zona de cobertura</Text>

            <TextInput
              style={styles.input}
              value={zonaCobertura}
              onChangeText={setZonaCobertura}
              placeholder="Ej. Portoviejo y alrededores"
              placeholderTextColor="#999"
            />
          </View>
        );

      case "transporte":
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informaci�n de transporte</Text>

            <Text style={styles.label}>Tipo de transporte</Text>

            <TextInput
              style={styles.input}
              value={tipoTransporte}
              onChangeText={setTipoTransporte}
              placeholder="Ej. Transporte de pasajeros"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Tipo de veh�culo</Text>

            <TextInput
              style={styles.input}
              value={tipoVehiculo}
              onChangeText={setTipoVehiculo}
              placeholder="Ej. Autom�vil"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Marca</Text>

            <TextInput
              style={styles.input}
              value={marcaVehiculo}
              onChangeText={setMarcaVehiculo}
              placeholder="Ej. Toyota"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Modelo</Text>

            <TextInput
              style={styles.input}
              value={modeloVehiculo}
              onChangeText={setModeloVehiculo}
              placeholder="Ej. Corolla"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>A�o</Text>

            <TextInput
              style={styles.input}
              value={anioVehiculo}
              onChangeText={setAnioVehiculo}
              placeholder="Ej. 2025"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Color</Text>

            <TextInput
              style={styles.input}
              value={colorVehiculo}
              onChangeText={setColorVehiculo}
              placeholder="Ej. Blanco"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Capacidad</Text>

            <TextInput
              style={styles.input}
              value={capacidadVehiculo}
              onChangeText={setCapacidadVehiculo}
              placeholder="Ej. 4 pasajeros"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Placa</Text>

            <TextInput
              style={styles.input}
              value={placaVehiculo}
              onChangeText={setPlacaVehiculo}
              placeholder="Ej. ABC-1234"
              placeholderTextColor="#999"
              autoCapitalize="characters"
            />

            <Text style={styles.label}>Precio base</Text>

            <TextInput
              style={styles.input}
              value={precioBase}
              onChangeText={setPrecioBase}
              placeholder="Ej. 2.50"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
            />

            <Text style={styles.label}>Precio por kil�metro</Text>

            <TextInput
              style={styles.input}
              value={precioKilometro}
              onChangeText={setPrecioKilometro}
              placeholder="Ej. 0.50"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
            />
          </View>
        );

      case "empresa":
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informaci�n empresarial</Text>

            <Text style={styles.label}>Raz�n social</Text>

            <TextInput
              style={styles.input}
              value={razonSocial}
              onChangeText={setRazonSocial}
              placeholder="Raz�n social"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>RUC</Text>

            <TextInput
              style={styles.input}
              value={ruc}
              onChangeText={setRuc}
              placeholder="N�mero de RUC"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Sector</Text>

            <TextInput
              style={styles.input}
              value={sector}
              onChangeText={setSector}
              placeholder="Ej. Comercio"
              placeholderTextColor="#999"
            />
          </View>
        );

      case "profesional":
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Perfil profesional</Text>

            <Text style={styles.label}>Profesi�n</Text>

            <TextInput
              style={styles.input}
              value={profesion}
              onChangeText={setProfesion}
              placeholder="Ej. Abogado"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Especialidad</Text>

            <TextInput
              style={styles.input}
              value={especialidad}
              onChangeText={setEspecialidad}
              placeholder="Ej. Derecho empresarial"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Experiencia</Text>

            <TextInput
              style={styles.input}
              value={experiencia}
              onChangeText={setExperiencia}
              placeholder="Ej. 5 a�os"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Certificaciones</Text>

            <TextInput
              style={[styles.input, styles.textArea]}
              value={certificaciones}
              onChangeText={setCertificaciones}
              placeholder="Describe tus certificaciones"
              placeholderTextColor="#999"
              multiline
            />

            <Text style={styles.label}>Modalidad de atenci�n</Text>

            <TextInput
              style={styles.input}
              value={modalidadProfesional}
              onChangeText={setModalidadProfesional}
              placeholder="Ej. Presencial y virtual"
              placeholderTextColor="#999"
            />
          </View>
        );

      case "otro":
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informaci�n adicional</Text>

            <Text style={styles.label}>Cu�ntanos sobre tu negocio</Text>

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe qu� productos o servicios ofrecer�s"
              placeholderTextColor="#999"
              multiline
            />
          </View>
        );

      default:
        return null;
    }
  };

  const renderHorarios = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Horarios de atenci�n</Text>

      {horarios.map((horario, indice) => (
        <View style={styles.horarioCard} key={horario.dia}>
          <View style={styles.horarioHeader}>
            <Text style={styles.dia}>{horario.dia}</Text>

            <Pressable
              style={[
                styles.estadoHorario,
                horario.abierto && styles.estadoHorarioActivo,
              ]}
              onPress={() =>
                actualizarHorario(indice, "abierto", !horario.abierto)
              }
            >
              <Text
                style={[
                  styles.estadoHorarioTexto,
                  horario.abierto && styles.estadoHorarioTextoActivo,
                ]}
              >
                {horario.abierto ? "Abierto" : "Cerrado"}
              </Text>
            </Pressable>
          </View>

          {horario.abierto && (
            <View style={styles.horasRow}>
              <TextInput
                style={styles.horaInput}
                value={horario.apertura}
                onChangeText={(valor) =>
                  actualizarHorario(indice, "apertura", valor)
                }
                placeholder="09:00"
                placeholderTextColor="#999"
              />

              <Text style={styles.hasta}>a</Text>

              <TextInput
                style={styles.horaInput}
                value={horario.cierre}
                onChangeText={(valor) =>
                  actualizarHorario(indice, "cierre", valor)
                }
                placeholder="20:00"
                placeholderTextColor="#999"
              />
            </View>
          )}
        </View>
      ))}
    </View>
  );

  const renderVistaPrevia = () => (
    <View style={styles.previewBox}>
      <View style={styles.previewIcon}>
        <MaterialCommunityIcons
          name="storefront-outline"
          size={42}
          color="#0066CC"
        />
      </View>

      <Text style={styles.previewNombre}>{nombre}</Text>

      <Text style={styles.previewTipo}>{tipoNombre}</Text>

      {categoria ? (
        <Text style={styles.previewCategoria}>{categoria}</Text>
      ) : null}

      <Text style={styles.previewDescripcion}>{descripcion}</Text>

      <View style={styles.previewDivider} />

      <View style={styles.previewRow}>
        <MaterialCommunityIcons
          name="map-marker-outline"
          size={21}
          color="#0066CC"
        />

        <Text style={styles.previewText}>
          {direccion}, {ciudad}
        </Text>
      </View>

      {telefono ? (
        <View style={styles.previewRow}>
          <MaterialCommunityIcons
            name="phone-outline"
            size={21}
            color="#0066CC"
          />

          <Text style={styles.previewText}>{telefono}</Text>
        </View>
      ) : null}

      <View style={styles.previewRow}>
        <MaterialCommunityIcons
          name="briefcase-outline"
          size={21}
          color="#0066CC"
        />

        <Text style={styles.previewText}>
          {tipoOferta === "productos"
            ? "Productos"
            : tipoOferta === "servicios"
              ? "Servicios"
              : "Productos y servicios"}
        </Text>
      </View>
    </View>
  );

  if (mostrarVistaPrevia) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => setMostrarVistaPrevia(false)}
          >
            <MaterialCommunityIcons name="arrow-left" size={26} color="#222" />
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.title}>Vista previa</Text>

            <Text style={styles.subtitle}>
              As� se ver� tu negocio en FrancisCorp
            </Text>
          </View>
        </View>

        {renderVistaPrevia()}

        <View style={styles.previewInfo}>
          <MaterialCommunityIcons
            name="information-outline"
            size={22}
            color="#0066CC"
          />

          <Text style={styles.previewInfoText}>
            Revisa la informaci�n antes de crear tu negocio.
          </Text>
        </View>

        <Pressable style={styles.createButton} onPress={crearNegocio}>
          <MaterialCommunityIcons
            name="check-circle-outline"
            size={25}
            color="#fff"
          />

          <Text style={styles.createButtonText}>Crear negocio</Text>
        </Pressable>

        <Pressable
          style={styles.editButton}
          onPress={() => setMostrarVistaPrevia(false)}
        >
          <Text style={styles.editButtonText}>Editar informaci�n</Text>
        </Pressable>

        <View style={styles.bottomSpace} />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* ================= ENCABEZADO ================= */}

      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={26} color="#222" />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.title}>Crear negocio</Text>

          <Text style={styles.subtitle}>
            Configura tu negocio {tipoNombre.toLowerCase()} en FrancisCorp
          </Text>
        </View>
      </View>

      {/* ================= TIPO ================= */}

      <View style={styles.tipoSeleccionado}>
        <View style={styles.tipoIcono}>
          <MaterialCommunityIcons
            name="storefront-outline"
            size={25}
            color="#0066CC"
          />
        </View>

        <View style={styles.tipoSeleccionadoTexto}>
          <Text style={styles.tipoLabel}>Tipo de negocio</Text>

          <Text style={styles.tipoValor}>{tipoNombre}</Text>
        </View>
      </View>

      {/* ================= INFORMACI�N GENERAL ================= */}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informaci�n del negocio</Text>

        <Text style={styles.label}>Nombre del negocio *</Text>

        <TextInput
          style={styles.input}
          value={nombre}
          onChangeText={setNombre}
          placeholder="Ej. El B�nker"
          placeholderTextColor="#999"
        />

        {renderCategoria()}

        <Text style={styles.label}>Descripci�n *</Text>

        <TextInput
          style={[styles.input, styles.textArea]}
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Describe brevemente tu negocio"
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
        />
      </View>

      {/* ================= CONTACTO ================= */}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contacto</Text>

        <Text style={styles.label}>Tel�fono</Text>

        <TextInput
          style={styles.input}
          value={telefono}
          onChangeText={setTelefono}
          placeholder="Ej. 0999999999"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>WhatsApp</Text>

        <TextInput
          style={styles.input}
          value={whatsapp}
          onChangeText={setWhatsapp}
          placeholder="N�mero de WhatsApp"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Correo electr�nico</Text>

        <TextInput
          style={styles.input}
          value={correo}
          onChangeText={setCorreo}
          placeholder="correo@ejemplo.com"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Redes sociales</Text>

        <TextInput
          style={styles.input}
          value={redesSociales}
          onChangeText={setRedesSociales}
          placeholder="@usuario o enlace"
          placeholderTextColor="#999"
          autoCapitalize="none"
        />

        <Text style={styles.label}>P�gina web</Text>

        <TextInput
          style={styles.input}
          value={paginaWeb}
          onChangeText={setPaginaWeb}
          placeholder="https://..."
          placeholderTextColor="#999"
          autoCapitalize="none"
        />
      </View>

      {/* ================= UBICACI�N ================= */}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ubicaci�n</Text>

        <View style={styles.mapPlaceholder}>
          <MaterialCommunityIcons
            name="map-marker-radius-outline"
            size={42}
            color="#0066CC"
          />

          <Text style={styles.mapTitle}>Ubicaci�n en mapa</Text>

          <Text style={styles.mapText}>
            M�s adelante conectaremos Google Maps para seleccionar la ubicaci�n
            exacta.
          </Text>
        </View>

        <Text style={styles.label}>Direcci�n *</Text>

        <TextInput
          style={styles.input}
          value={direccion}
          onChangeText={setDireccion}
          placeholder="Ingresa la direcci�n"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Ciudad *</Text>

        <TextInput
          style={styles.input}
          value={ciudad}
          onChangeText={setCiudad}
          placeholder="Ej. Portoviejo"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Provincia</Text>

        <TextInput
          style={styles.input}
          value={provincia}
          onChangeText={setProvincia}
          placeholder="Ej. Manab�"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Referencia</Text>

        <TextInput
          style={styles.input}
          value={referencia}
          onChangeText={setReferencia}
          placeholder="Ej. Frente al parque"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Zona de cobertura</Text>

        <TextInput
          style={styles.input}
          value={zonaCobertura}
          onChangeText={setZonaCobertura}
          placeholder="Ej. Portoviejo y alrededores"
          placeholderTextColor="#999"
        />
      </View>

      {/* ================= ESPECIALIDAD ================= */}

      {renderEspecialidad()}

      {/* ================= HORARIOS ================= */}

      {renderHorarios()}

      {/* ================= OFERTA ================= */}

      {renderOferta()}

      {/* ================= INFORMACI�N FINAL ================= */}

      <View style={styles.infoBox}>
        <MaterialCommunityIcons
          name="information-outline"
          size={23}
          color="#0066CC"
        />

        <Text style={styles.infoText}>
          Puedes crear varios negocios dentro de FrancisCorp. Cada negocio
          tendr� su propia informaci�n, productos y servicios.
        </Text>
      </View>

      {/* ================= CONTINUAR ================= */}

      <Pressable style={styles.createButton} onPress={continuar}>
        <MaterialCommunityIcons
          name="arrow-right-circle-outline"
          size={25}
          color="#fff"
        />

        <Text style={styles.createButtonText}>Continuar a vista previa</Text>
      </Pressable>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  contentContainer: {
    paddingBottom: 40,
  },

  header: {
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F4F8FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 27,
    fontWeight: "700",
    color: "#222",
  },

  subtitle: {
    marginTop: 3,
    fontSize: 14,
    color: "#777",
    lineHeight: 19,
  },

  tipoSeleccionado: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 14,
    borderRadius: 15,
    backgroundColor: "#F4F8FF",
    flexDirection: "row",
    alignItems: "center",
  },

  tipoIcono: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  tipoSeleccionadoTexto: {
    marginLeft: 12,
    flex: 1,
  },

  tipoLabel: {
    fontSize: 12,
    color: "#777",
  },

  tipoValor: {
    marginTop: 2,
    fontSize: 18,
    fontWeight: "700",
    color: "#0066CC",
  },

  section: {
    marginHorizontal: 20,
    marginTop: 25,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
    marginBottom: 15,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
    marginBottom: 7,
    marginTop: 12,
  },

  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 15,
    color: "#222",
    backgroundColor: "#FAFAFA",
  },

  textArea: {
    minHeight: 110,
    paddingTop: 14,
    textAlignVertical: "top",
  },

  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  chip: {
    borderWidth: 1,
    borderColor: "#D9E2EC",
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 9,
    backgroundColor: "#fff",
  },

  chipActivo: {
    backgroundColor: "#0066CC",
    borderColor: "#0066CC",
  },

  chipTexto: {
    fontSize: 13,
    color: "#555",
  },

  chipTextoActivo: {
    color: "#fff",
    fontWeight: "700",
  },

  mapPlaceholder: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: "#F4F8FF",
    alignItems: "center",
    marginBottom: 5,
  },

  mapTitle: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },

  mapText: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
    color: "#777",
    textAlign: "center",
  },

  horarioCard: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 14,
    padding: 13,
    marginBottom: 10,
    backgroundColor: "#fff",
  },

  horarioHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dia: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
  },

  estadoHorario: {
    borderRadius: 18,
    paddingHorizontal: 13,
    paddingVertical: 7,
    backgroundColor: "#F3F3F3",
  },

  estadoHorarioActivo: {
    backgroundColor: "#E8F2FF",
  },

  estadoHorarioTexto: {
    fontSize: 12,
    color: "#777",
    fontWeight: "600",
  },

  estadoHorarioTextoActivo: {
    color: "#0066CC",
  },

  horasRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  horaInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#222",
    backgroundColor: "#FAFAFA",
  },

  hasta: {
    marginHorizontal: 10,
    fontSize: 14,
    color: "#777",
  },

  option: {
    minHeight: 75,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 14,
    marginBottom: 12,
    paddingHorizontal: 15,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  optionActivo: {
    borderColor: "#0066CC",
    backgroundColor: "#F4F8FF",
  },

  optionText: {
    flex: 1,
    marginLeft: 13,
  },

  optionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },

  optionDescription: {
    marginTop: 3,
    fontSize: 13,
    color: "#777",
    lineHeight: 18,
  },

  infoBox: {
    marginHorizontal: 20,
    marginTop: 22,
    padding: 16,
    borderRadius: 15,
    backgroundColor: "#F4F8FF",
    flexDirection: "row",
    alignItems: "flex-start",
  },

  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    lineHeight: 20,
    color: "#555",
  },

  createButton: {
    marginHorizontal: 20,
    marginTop: 25,
    minHeight: 55,
    borderRadius: 14,
    backgroundColor: "#0066CC",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  createButtonText: {
    marginLeft: 9,
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },

  previewBox: {
    marginHorizontal: 20,
    marginTop: 25,
    padding: 24,
    borderRadius: 20,
    backgroundColor: "#F7F9FC",
    alignItems: "center",
  },

  previewIcon: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  previewNombre: {
    fontSize: 26,
    fontWeight: "700",
    color: "#222",
    textAlign: "center",
  },

  previewTipo: {
    marginTop: 5,
    fontSize: 15,
    fontWeight: "700",
    color: "#0066CC",
  },

  previewCategoria: {
    marginTop: 4,
    fontSize: 14,
    color: "#777",
  },

  previewDescripcion: {
    marginTop: 14,
    fontSize: 15,
    lineHeight: 22,
    color: "#555",
    textAlign: "center",
  },

  previewDivider: {
    width: "100%",
    height: 1,
    backgroundColor: "#E2E6EA",
    marginVertical: 18,
  },

  previewRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  previewText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: "#555",
  },

  previewInfo: {
    marginHorizontal: 20,
    marginTop: 18,
    padding: 15,
    borderRadius: 14,
    backgroundColor: "#F4F8FF",
    flexDirection: "row",
    alignItems: "center",
  },

  previewInfoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    lineHeight: 20,
    color: "#555",
  },

  editButton: {
    marginHorizontal: 20,
    marginTop: 12,
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#0066CC",
    justifyContent: "center",
    alignItems: "center",
  },

  editButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0066CC",
  },

  bottomSpace: {
    height: 25,
  },
});
