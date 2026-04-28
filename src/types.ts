import React from 'react';

export interface Unit {
  title: string;
  description: string;
  exercises: {
    question: string;
    options: string[];
    correct: number;
  }[];
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  units: Unit[];
}

export const SUBJECTS: Subject[] = [
  {
    id: 'biologia',
    name: 'Biología',
    icon: 'Leaf',
    color: 'green',
    description: 'Estudio de los seres vivos como sistemas abiertos y complejos, analizando su composición molecular y niveles de organización.',
    units: [
      {
        title: 'Concepto de Sistema',
        description: 'Sistemas aislados (sin intercambio), cerrados (solo energía) y abiertos (materia y energía).',
        exercises: [
          { question: '¿Qué intercambia un sistema abierto?', options: ['Nada', 'Solo energía', 'Materia y energía', 'Solo materia'], correct: 2 },
          { question: '¿Cuál es un ejemplo de sistema aislado ideal?', options: ['Un ser vivo', 'Un termo cerrado', 'Una botella abierta', 'Una planta'], correct: 1 },
          { question: 'Un sistema que intercambia energía pero no materia es:', options: ['Abierto', 'Cerrado', 'Aislado', 'Complejo'], correct: 1 },
          { question: '¿Qué son las propiedades emergentes?', options: ['Propiedades de cada parte', 'Propiedades que aparecen al estudiar el sistema como un todo', 'Propiedades que desaparecen', 'Propiedades del entorno'], correct: 1 },
          { question: '¿Por qué los seres vivos son sistemas complejos?', options: ['Porque son grandes', 'Porque tienen un solo componente', 'Porque están formados por varios subsistemas coordinados', 'Porque no cambian'], correct: 2 }
        ]
      },
      {
        title: 'Biomoléculas: Lípidos y Proteínas',
        description: 'Funciones energéticas, estructurales y reguladoras de las moléculas de la vida.',
        exercises: [
          { question: '¿Cuál es una función de los lípidos?', options: ['Transporte de oxígeno', 'Reserva de energía', 'Código genético', 'Digestión'], correct: 1 },
          { question: '¿De qué están formadas las proteínas?', options: ['Monosacáridos', 'Ácidos grasos', 'Aminoácidos', 'Nucleótidos'], correct: 2 },
          { question: '¿Qué proteína transporta oxígeno en la sangre?', options: ['Miosina', 'Colágeno', 'Hemoglobina', 'Queratina'], correct: 2 },
          { question: 'Los lípidos que forman las membranas celulares son:', options: ['Grasas', 'Fosfolípidos', 'Ceras', 'Aceites'], correct: 1 },
          { question: '¿Qué biomolécula actúa como aislante térmico en mamíferos?', options: ['Proteínas', 'Glúcidos', 'Lípidos (grasas)', 'ADN'], correct: 2 }
        ]
      },
      {
        title: 'Hidratos de Carbono y ADN',
        description: 'Glúcidos para energía rápida y ácidos nucleicos para la herencia genética.',
        exercises: [
          { question: '¿Qué molécula contiene la información genética?', options: ['Glucosa', 'Lípido', 'ADN', 'Almidón'], correct: 2 },
          { question: '¿Cuál es el azúcar más sencillo usado como fuente de energía?', options: ['Almidón', 'Celulosa', 'Glucosa', 'Quitina'], correct: 2 },
          { question: '¿Dónde se encuentra la información para fabricar proteínas?', options: ['En las grasas', 'En los genes (ADN)', 'En los músculos', 'En el agua'], correct: 1 },
          { question: '¿Qué hidrato de carbono forma la pared de las células vegetales?', options: ['Glucógeno', 'Celulosa', 'Almidón', 'Lípido'], correct: 1 },
          { question: 'La estructura del ADN se describe como:', options: ['Una esfera', 'Una línea simple', 'Una doble hélice', 'Un cubo'], correct: 2 }
        ]
      }
    ]
  },
  {
    id: 'geografia',
    name: 'Geografía',
    icon: 'Globe',
    color: 'blue',
    description: 'Análisis de los espacios geográficos, la relación entre sociedad y naturaleza, y la organización del territorio.',
    units: [
      {
        title: 'Geografía y su Objeto de Estudio',
        description: 'El espacio geográfico como producto social en permanente transformación. Conceptos de Paisaje, Ambiente, Territorio, Región y Recursos Naturales.',
        exercises: [
          { question: '¿Qué diferencia a la Población de la Sociedad en Geografía?', options: ['Son sinónimos', 'Población es el grupo; Sociedad comparte vivencias y cultura', 'Sociedad es solo para ciudades', 'Población es para animales'], correct: 1 },
          { question: '¿Qué es el espacio geográfico?', options: ['La naturaleza virgen', 'El resultado de la interacción entre sociedad y ambiente', 'Solo los mapas', 'El espacio exterior'], correct: 1 },
          { question: 'Un área delimitada donde se ejerce poder se llama:', options: ['Paisaje', 'Región', 'Territorio', 'Ambiente'], correct: 2 },
          { question: '¿Cuándo un recurso natural deja de serlo?', options: ['Nunca', 'Cuando la sociedad deja de valorarlo', 'Cuando se acaba', 'Cuando llueve'], correct: 1 },
          { question: '¿Qué estudia la Geografía en la actualidad?', options: ['Solo dónde están los ríos', 'Cómo las sociedades organizan su territorio', 'Solo las capitales', 'Solo el clima'], correct: 1 }
        ]
      },
      {
        title: 'Esfera Terrestre y Líneas Imaginarias',
        description: 'Eje terrestre (23° 27\'), Paralelos (Ecuador, Trópicos, Círculos Polares) y Meridianos (Greenwich, Antimeridiano).',
        exercises: [
          { question: '¿Qué meridiano divide la Tierra en hemisferio Oriental y Occidental?', options: ['Ecuador', 'Círculo Polar', 'Meridiano de Greenwich', 'Trópico de Cáncer'], correct: 2 },
          { question: '¿Qué línea divide la Tierra en hemisferio Norte y Sur?', options: ['Eje terrestre', 'Ecuador', 'Greenwich', 'Antimeridiano'], correct: 1 },
          { question: '¿Cuál es la inclinación del eje terrestre?', options: ['0°', '45°', '23° 27\'', '90°'], correct: 2 },
          { question: '¿Qué círculos se encuentran cerca de los polos?', options: ['Trópicos', 'Ecuador', 'Círculos Polares', 'Meridiano 180°'], correct: 2 },
          { question: 'El antimeridiano se encuentra a los:', options: ['0°', '90°', '180°', '360°'], correct: 2 }
        ]
      },
      {
        title: 'Orientación y Coordenadas',
        description: 'Localización absoluta mediante Latitud (distancia al Ecuador) y Longitud (distancia a Greenwich). Localización relativa.',
        exercises: [
          { question: '¿De dónde a dónde se mide la Longitud?', options: ['De Norte a Sur', 'De Este a Oeste (desde Greenwich)', 'Del Ecuador a los Polos', 'De la base a la cima'], correct: 1 },
          { question: 'La distancia de un punto al Ecuador se llama:', options: ['Longitud', 'Altitud', 'Latitud', 'Localización relativa'], correct: 2 },
          { question: '¿Qué coordenadas necesitamos para una localización absoluta?', options: ['Solo Latitud', 'Solo Longitud', 'Latitud y Longitud', 'Puntos cardinales'], correct: 2 },
          { question: '¿Cuál es la latitud máxima en los polos?', options: ['0°', '45°', '90°', '180°'], correct: 2 },
          { question: 'Ubicar un objeto respecto de otro es localización:', options: ['Absoluta', 'Exacta', 'Relativa', 'Astronómica'], correct: 2 }
        ]
      }
    ]
  },
  {
    id: 'historia',
    name: 'Historia',
    icon: 'Scroll',
    color: 'amber',
    description: 'Exploración del pasado desde los orígenes de la humanidad hasta la disolución del Imperio Romano.',
    units: [
      {
        title: 'El Método del Historiador',
        description: 'La Historia como ciencia social. Hechos, fuentes primarias/secundarias y líneas de tiempo.',
        exercises: [
          { question: '¿Cuál es el "puente" que une el presente con el pasado según Benedetto Croce?', options: ['Los libros', 'La memoria', 'Toda historia es historia del presente', 'Los museos'], correct: 2 },
          { question: '¿Qué es una fuente histórica?', options: ['Cualquier resto del pasado que aporte datos', 'Solo libros', 'Solo estatuas', 'Solo videos'], correct: 0 },
          { question: 'Un diario íntimo de 1810 es una fuente:', options: ['Secundaria', 'Terciaria', 'Primaria', 'Oral'], correct: 2 },
          { question: '¿Para qué sirve una línea de tiempo?', options: ['Para medir el clima', 'Para representar gráficamente un período determinado', 'Para viajar al pasado', 'Solo para dibujar'], correct: 1 },
          { question: 'La "honestidad intelectual" es un compromiso de:', options: ['El político', 'El historiador', 'El deportista', 'El arquitecto'], correct: 1 }
        ]
      },
      {
        title: 'Poblamiento de América',
        description: 'Teorías sobre el origen del hombre americano: Asiática (Bering), Oceánica y Australiana.',
        exercises: [
          { question: '¿Qué teoría propuso que el hombre cruzó por el Estrecho de Bering?', options: ['Teoría Oceánica', 'Teoría Asiática', 'Teoría Australiana', 'Teoría Autoctonista'], correct: 1 },
          { question: '¿Quién propuso la Teoría Oceánica?', options: ['Alex Hrdlicka', 'Paul Rivet', 'Florentino Ameghino', 'Mendes Correia'], correct: 1 },
          { question: '¿Qué teoría fue refutada por la ciencia?', options: ['Asiática', 'Australiana', 'Autoctonista de Ameghino', 'Oceánica'], correct: 2 },
          { question: '¿Hace cuánto habrían llegado los humanos según el Consenso Clovis?', options: ['13.000 años', '40.000 años', '2.000 años', '100.000 años'], correct: 0 },
          { question: '¿Qué hacían los primeros grupos humanos en América?', options: ['Eran agricultores', 'Eran cazadores-recolectores nómades', 'Construían ciudades metálicas', 'Vivían en barcos'], correct: 1 }
        ]
      },
      {
        title: 'Civilización Caral',
        description: 'La civilización más antigua de América (3000 a.C.). Urbanismo planificado y quipus.',
        exercises: [
          { question: '¿Hace cuántos años surgió la civilización de Caral?', options: ['1000 años', '2000 años', '5000 años', '10000 años'], correct: 2 },
          { question: '¿Qué usaban en Caral para registrar información?', options: ['Papel', 'Computadoras', 'Quipus (cuerdas con nudos)', 'Tablillas de arcilla'], correct: 2 },
          { question: '¿Cuál era un cultivo esencial en Caral para redes de pesca?', options: ['Maíz', 'Trigo', 'Algodón', 'Papa'], correct: 2 },
          { question: '¿Qué edificios destacan en el centro urbano de Caral?', options: ['Rascacielos', 'Pirámides y plazas circulares', 'Castillos feudales', 'Estadios modernos'], correct: 1 },
          { question: 'Caral se desarrolló en aislamiento, sin contacto con:', options: ['La costa', 'Otras civilizaciones lejanas', 'La montaña', 'Los ríos'], correct: 1 }
        ]
      },
      {
        title: 'Egipto y Grecia',
        description: 'Primeros estados, escritura, religión politeísta y el origen de la democracia en Atenas.',
        exercises: [
          { question: '¿En qué ciudad griega nació la Democracia?', options: ['Esparta', 'Atenas', 'Micenas', 'Corinto'], correct: 1 },
          { question: '¿Cómo se llama la escritura de los antiguos egipcios?', options: ['Cuneiforme', 'Jeroglífica', 'Alfabeto latino', 'Pictografía mixteca'], correct: 1 },
          { question: 'El sistema político donde el poder está en manos de unos pocos es:', options: ['Democracia', 'Oligarquía', 'República', 'Anarquía'], correct: 1 },
          { question: '¿Cuál era el centro de la vida social y política en Grecia?', options: ['El oikos', 'La polis', 'El barco', 'La pirámide'], correct: 1 },
          { question: 'Atenas tuvo un gobernante famoso por pagar sueldos públicos:', options: ['Dracón', 'Solón', 'Pericles', 'Alejandro Magno'], correct: 2 }
        ]
      },
      {
        title: 'Roma e Invasiones',
        description: 'De la Monarquía a la República y el Imperio. La caída de Roma y las sociedades medievales.',
        exercises: [
          { question: '¿En qué año cayó el Imperio Romano de Occidente?', options: ['310 d.C.', '476 d.C.', '1453 d.C.', '1789 d.C.'], correct: 1 },
          { question: '¿Cómo se llamaban los dos grupos sociales en la República Romana?', options: ['Ricos y Pobres', 'Patricios y Plebeyos', 'Senadores y Reyes', 'Soldados y Esclavos'], correct: 1 },
          { question: '¿Qué religión fue perseguida y luego oficial en Roma?', options: ['Islamismo', 'Judaísmo', 'Cristianismo', 'Politeísmo griego'], correct: 2 },
          { question: '¿Qué pueblo liderado por Atila presionó a los germanos?', options: ['Los romanos', 'Los griegos', 'Los hunos', 'Los vikingos'], correct: 2 },
          { question: 'Un gran aporte de ingeniería romana para llevar agua fue:', options: ['El barco', 'El acueducto', 'El molino', 'El pozo'], correct: 1 }
        ]
      }
    ]
  },
  {
    id: 'fec',
    name: 'FEC',
    icon: 'ShieldCheck',
    color: 'indigo',
    description: 'Formación Ética y Ciudadana: Sociedad, normas y derechos.',
    units: [
      {
        title: 'Libertad y Dignidad',
        description: 'La libertad individual y social. La dignidad humana como cualidad inherente.',
        exercises: [
          { question: '¿Cuál es la libertad relacionada con pensamientos y deseos propios?', options: ['Libertad Social', 'Libertad Política', 'Libertad Individual', 'Libertad Económica'], correct: 2 },
          { question: 'La dignidad humana se funda en ser sujetos:', options: ['Ricos y poderosos', 'Conscientes, sociales, dotados de inteligencia y libertad', 'Solo obedientes', 'Sin derechos'], correct: 1 },
          { question: '¿Qué puede limitar la libertad de una persona en el mundo actual?', options: ['Solo las leyes', 'La extrema pobreza que impide satisfacer necesidades básicas', 'Solo el clima', 'Nada la limita'], correct: 1 },
          { question: 'La libertad social se define por las relaciones entre:', options: ['Animales', 'Miembros de una comunidad', 'Países lejanos', 'Máquinas'], correct: 1 },
          { question: 'Libertad y dignidad son conceptos:', options: ['Separados', 'Opuestos', 'Estrechamente unidos y vinculados', 'Innecesarios'], correct: 2 }
        ]
      },
      {
        title: 'Las Normas',
        description: 'Reglas para la convivencia. Tipos: sociales, morales, culturales y jurídicas.',
        exercises: [
          { question: '¿Qué tipo de normas son los "usos y costumbres" como saludar?', options: ['Morales', 'Sociales', 'Jurídicas', 'Religiosas'], correct: 1 },
          { question: 'Las normas que valoran lo correcto/incorrecto en la conciencia son:', options: ['Sociales', 'Morales', 'Jurídicas', 'Culturales'], correct: 1 },
          { question: '¿Qué caracteriza a las normas jurídicas?', options: ['Son solo consejos', 'Están escritas y son obligatorias por el Estado', 'Cambian cada hora', 'No tienen sanción'], correct: 1 },
          { question: 'Cantar el himno en la escuela es una norma:', options: ['Moral', 'Social', 'Cultural', 'Jurídica'], correct: 2 },
          { question: '¿Toda norma tiene implícito un grado de?', options: ['Diversión', 'Obligatoriedad', 'Miedo', 'Olvido'], correct: 1 }
        ]
      },
      {
        title: 'La Constitución Nacional',
        description: 'Ley Suprema de Argentina. Derechos, deberes y garantías fundamentales.',
        exercises: [
          { question: '¿Cómo se llama la introducción de la Constitución Nacional?', options: ['Declaración', 'Garantía', 'Preámbulo', 'Artículo 1'], correct: 2 },
          { question: '¿Qué artículo establece que la Constitución es la Ley Suprema?', options: ['Artículo 1', 'Artículo 14', 'Artículo 31', 'Artículo 75'], correct: 2 },
          { question: 'La Constitución organiza a la sociedad:', options: ['Familiarmente', 'Jurídica y políticamente', 'Solo económicamente', 'Deportivamente'], correct: 1 },
          { question: '¿Qué son los derechos en la Constitución?', options: ['Obligaciones del ciudadano', 'Facultades reconocidas a las personas', 'Leyes secretas', 'Solo para gobernantes'], correct: 1 },
          { question: 'El sistema democrático se caracteriza por:', options: ['Poder concentrado en uno', 'Soberanía popular y división de poderes', 'Sin leyes escritas', 'Reyes hereditarios'], correct: 1 }
        ]
      }
    ]
  },
  {
    id: 'ingles',
    name: 'Inglés',
    icon: 'Languages',
    color: 'red',
    description: 'Desarrollo de competencias lingüísticas en lengua inglesa.',
    units: [
      {
        title: 'Present and Past Tenses',
        description: 'Review of Present Simple vs Continuous and Past Simple vs Continuous.',
        exercises: [
          { question: 'Complete: "I ____ (watch) TV when he arrived."', options: ['watch', 'am watching', 'watched', 'was watching'], correct: 3 },
          { question: 'Which is correct for a daily habit?', options: ['I am going to school', 'I go to school', 'I went to school', 'I will go to school'], correct: 1 },
          { question: 'Complete: "She ____ (study) at the moment."', options: ['studies', 'is studying', 'studied', 'was studying'], correct: 1 },
          { question: 'Past tense of "Bring":', options: ['Bringed', 'Brought', 'Brang', 'Broughted'], correct: 1 },
          { question: 'What is the auxiliary for Past Simple questions?', options: ['Do', 'Does', 'Did', 'Done'], correct: 2 }
        ]
      },
      {
        title: 'Vocabulary: Environment',
        description: 'Words related to ecology, pollution, and recycling.',
        exercises: [
          { question: 'What does "Pollution" mean?', options: ['Limpieza', 'Contaminación', 'Reciclaje', 'Naturaleza'], correct: 1 },
          { question: 'A synonym for "Ecology":', options: ['Environment', 'Economy', 'Education', 'Electronics'], correct: 0 },
          { question: 'What is "Sustainability"?', options: ['Gastos rápidos', 'Desarrollo sustentable', 'Sin recursos', 'Solo reciclaje'], correct: 1 },
          { question: 'Which one is NOT a natural resource?', options: ['Water', 'Solar energy', 'Plastic', 'Wind'], correct: 2 },
          { question: 'To "Reuse" something means:', options: ['Throw it away', 'Buy a new one', 'Use it again', 'Recycle it into material'], correct: 2 }
        ]
      }
    ]
  }
];
