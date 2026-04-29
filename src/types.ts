import React from 'react';

export interface Unit {
  title: string;
  description: string;
  explanation: string;
  meanings: { term: string, definition: string }[];
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
        explanation: 'En biología, un sistema es un conjunto de componentes que interactúan entre sí. Los seres vivos son sistemas abiertos porque intercambian constantemente materia (nutrientes, agua) y energía (calor, luz) con su entorno. Esta capacidad es vital para mantener el equilibrio interno u homeostasis.',
        meanings: [
          { term: 'Sistema Abierto', definition: 'Aquel que intercambia materia y energía con el ambiente.' },
          { term: 'Homeostasis', definition: 'Capacidad de mantener condiciones internas constantes.' },
          { term: 'Complejidad', definition: 'Presencia de múltiples niveles de organización coordinados.' }
        ],
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
        explanation: 'Las biomoléculas son los ladrillos de la vida. Los lípidos no solo almacenan energía a largo plazo, sino que también actúan como aislantes térmicos. Las proteínas, por otro lado, son máquinas moleculares: transportan oxígeno (hemoglobina), defienden el cuerpo (anticuerpos) y forman estructuras (colágeno).',
        meanings: [
          { term: 'Aminoácidos', definition: 'Unidades básicas que forman las proteínas.' },
          { term: 'Fosfolípidos', definition: 'Lípidos que forman la estructura de las membranas celulares.' },
          { term: 'Enzimas', definition: 'Proteínas que aceleran las reacciones químicas en la célula.' }
        ],
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
        explanation: 'Los glúcidos o hidratos de carbono son el combustible inmediato de la célula (glucosa). El ADN es el manual de instrucciones; contiene la secuencia de genes que determina desde el color de ojos hasta cómo fabricar proteínas específicas.',
        meanings: [
          { term: 'Glucosa', definition: 'Azúcar simple de uso energético inmediato.' },
          { term: 'ADN', definition: 'Ácido desoxirribonucleico, base de la herencia genética.' },
          { term: 'Doble Hélice', definition: 'Forma retorcida de la estructura del ADN.' }
        ],
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
        description: 'El espacio geográfico como producto social en permanente transformación.',
        explanation: 'El espacio geográfico no es solo la naturaleza, sino cómo la sociedad la organiza y transforma. Conceptos como Paisaje (lo que vemos), Ambiente (relación sociedad-naturaleza) y Territorio (espacio con poder) son claves para entender nuestro mundo.',
        meanings: [
          { term: 'Espacio Geográfico', definition: 'Construcción social a partir de la naturaleza.' },
          { term: 'Recurso Natural', definition: 'Elemento de la naturaleza valorado por la sociedad.' },
          { term: 'Región', definition: 'Área con características comunes que la distinguen.' }
        ],
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
        description: 'Eje terrestre (23° 27\'), Paralelos (Ecuador) y Meridianos (Greenwich).',
        explanation: 'La Tierra no es una esfera perfecta (es un geoide). El eje terrestre está inclinado, lo que genera las estaciones. Los paralelos miden la latitud (Norte-Sur) y los meridianos la longitud (Este-Oeste).',
        meanings: [
          { term: 'Ecuador', definition: 'Paralelo 0° que divide la Tierra en Hemisferio N y S.' },
          { term: 'Greenwich', definition: 'Meridiano 0° que divide la Tierra en Hemisferio E y O.' },
          { term: 'Antimeridiano', definition: 'Meridiano de 180°, opuesto a Greenwich.' }
        ],
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
        description: 'Localización absoluta mediante Latitud (distancia al Ecuador) y Longitud (distancia a Greenwich).',
        explanation: 'Para encontrar un punto exacto usamos las coordenadas geográficas. La Latitud es la separación respecto al Ecuador y la Longitud respecto a Greenwich. Si sabemos ambas, tenemos una localización absoluta.',
        meanings: [
          { term: 'Localización Absoluta', definition: 'Ubicación exacta mediante coordenadas.' },
          { term: 'Puntos Cardinales', definition: 'Norte, Sur, Este y Oeste.' },
          { term: 'Rosa de los Vientos', definition: 'Símbolo usado para marcar la orientación.' }
        ],
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
        explanation: 'El historiador no inventa, reconstruye. Interroga fuentes (cartas, diarios, restos arqueológicos) para entender por qué las cosas sucedieron. Las líneas de tiempo ayudan a ver procesos y cambios a través de los siglos.',
        meanings: [
          { term: 'Fuente Primaria', definition: 'Documento o resto de la época estudiada.' },
          { term: 'Fuente Secundaria', definition: 'Análisis hecho por historiadores posteriores.' },
          { term: 'Cronología', definition: 'Ordenación de eventos en el tiempo.' }
        ],
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
        explanation: 'América fue el último continente en poblarse. La teoría más robusta es la Asiática (cruce por Bering). Los primeros americanos eran nómades, cazadores de megafauna y recolectores que se adaptaron a climas extremos.',
        meanings: [
          { term: 'Nómade', definition: 'Que no vive en un lugar fijo.' },
          { term: 'Megafauna', definition: 'Animales gigantes del pleistoceno (mamuts, etc).' },
          { term: 'Estrecho de Bering', definition: 'Puente terrestre temporal durante la glaciación.' }
        ],
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
        explanation: 'En el valle de Supe surgió Caral. Sin murallas defensivas, parece haber sido un centro de paz y comercio. Usaban algodón para redes de pesca y quipus para registrar contabilidad mucho antes que los Incas.',
        meanings: [
          { term: 'Urbanismo', definition: 'Planificación de ciudades y edificios.' },
          { term: 'Quipu', definition: 'Cuerdas anudadas para registro de datos.' },
          { term: 'Teocracia', definition: 'Sistema donde los líderes eran figuras religiosas.' }
        ],
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
        explanation: 'Egipto floreció junto al Nilo con faraones y pirámides. Grecia nos dio la Polis y la Democracia. Atenas fue la primera ciudad donde los ciudadanos debatían y votaban leyes en la plaza pública (Ágora).',
        meanings: [
          { term: 'Polis', definition: 'Ciudad-Estado griega independiente.' },
          { term: 'Democracia', definition: 'Poder del pueblo (Demos: pueblo, Kratos: poder).' },
          { term: 'Politeísmo', definition: 'Creencia en muchos dioses.' }
        ],
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
        explanation: 'Roma pasó de aldea a imperio mundial. Su arquitectura y derecho son la base de Occidente. El imperio cayó ante la presión de pueblos germanos y hunos, dando inicio a la fragmentación de Europa (Edad Media).',
        meanings: [
          { term: 'República', definition: 'Cosa pública, sistema con magistrados y senado.' },
          { term: 'Patricio', definition: 'Grupo social privilegiado en la antigua Roma.' },
          { term: 'Hunos', definition: 'Pueblo nómade de Asia central liderado por Atila.' }
        ],
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
        explanation: 'Ser digno significa ser valioso por sí mismo. La libertad nos permite ser dueños de nuestras acciones, pero tiene límites: no podemos violar los derechos de los demás. La libertad social depende de que todos tengan sus necesidades básicas cubiertas.',
        meanings: [
          { term: 'Dignidad Humana', definition: 'Valor supremo de la persona por ser humana.' },
          { term: 'Empatía', definition: 'Capacidad de ponerse en el lugar del otro.' },
          { term: 'Ética', definition: 'Reflexión sobre lo que es justo o correcto.' }
        ],
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
        explanation: 'Para vivir juntos necesitamos reglas. Las sociales son costumbres (saludar). Las morales son lo que nuestra conciencia dicta. Las jurídicas son las leyes: están escritas, son obligatorias y tienen sanciones si no se cumplen.',
        meanings: [
          { term: 'Ley', definition: 'Norma jurídica obligatoria dictada por autoridad.' },
          { term: 'Sanción', definition: 'Consecuencia de incumplir una norma.' },
          { term: 'Convivencia', definition: 'Vivir en armonía con otros en un mismo espacio.' }
        ],
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
        explanation: 'Es la "madre" de todas las leyes. Establece la forma de gobierno (Representativa, Republicana y Federal) y protege nuestros derechos fundamentales. Ninguna ley puede ir en contra de ella (Supremacía).',
        meanings: [
          { term: 'Preámbulo', definition: 'Introducción que indica los objetivos del país.' },
          { term: 'Garantía', definition: 'Mecanismo para proteger un derecho violado.' },
          { term: 'Soberanía', definition: 'Poder supremo del pueblo para elegir su rumbo.' }
        ],
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
    description: 'Desarrollo de competencias lingüísticas: gramática, tiempos verbales y estructuras de comunicación.',
    units: [
      {
        title: 'Present Simple & Continuous',
        description: 'Diferencia entre hábitos y acciones en progreso (Unit 1 Basic Grammar).',
        explanation: 'El Present Simple se usa para rutinas y verdades universales (The Earth goes around the Sun). El Present Continuous se usa para acciones que ocurren ahora mismo (I am doing my homework).',
        meanings: [
          { term: 'Present Simple', definition: 'Para hábitos, rutinas y hechos permanentes.' },
          { term: 'Present Continuous', definition: 'Para acciones que están pasando en el momento de hablar.' },
          { term: 'Frequency Adverbs', definition: 'Palabras como "usually" o "never" que indican qué tan seguido hacemos algo.' }
        ],
        exercises: [
          { question: 'They never ____ to bed late.', options: ['go', 'goes', 'going', 'are going'], correct: 0 },
          { question: 'The Earth ____ around the Sun.', options: ['go', 'goes', 'going', 'is going'], correct: 1 },
          { question: 'I ____ my homework at the moment.', options: ['do', 'does', 'doing', 'am doing'], correct: 3 },
          { question: 'Ian ____ football regularly.', options: ['play', 'plays', 'playing', 'is playing'], correct: 1 },
          { question: 'Rewrite: "Ian plays football regularly" (Negative)', options: ['Ian no plays football', "Ian doesn't plays football", "Ian doesn't play football", "Ian isn't playing football"], correct: 2 }
        ]
      },
      {
        title: 'Present Perfect Simple & Continuous',
        description: 'Acciones que comenzaron en el pasado y continúan o tienen relevancia hoy.',
        explanation: 'El Present Perfect Simple (have + participio) se usa para resultados o experiencias. El Present Perfect Continuous (have been + ing) se usa para enfatizar la duración de una actividad que comenzó en el pasado.',
        meanings: [
          { term: 'For / Since', definition: 'Usados para indicar duración o punto de partida.' },
          { term: 'Recently / Yet', definition: 'Palabras clave para conectar el pasado con el presente.' },
          { term: 'Duration', definition: 'El enfoque principal del Present Perfect Continuous.' }
        ],
        exercises: [
          { question: 'She __________ English for five years.', options: ['studies', 'is studying', 'has been studying', 'studied'], correct: 2 },
          { question: 'He __________ his homework yet.', options: ['hasn\'t finished', 'not finished', 'is not finishing', 'didn\'t finish'], correct: 0 },
          { question: 'I __________ a lot with my sisters recently.', options: ['fought', 'have been fighting', 'am fighting', 'fight'], correct: 1 },
          { question: 'We __________ lemonade all afternoon.', options: ['made', 'make', 'have been making', 'are making'], correct: 2 },
          { question: 'I __________ her for five years.', options: ['know', 'am knowing', 'have known', 'have been knowing'], correct: 2 }
        ]
      },
      {
        title: 'Future Tenses: Will vs Going to',
        description: 'Predicciones, planes, intenciones y arreglos futuros.',
        explanation: 'Usamos "will" para predicciones o decisiones espontáneas. Usamos "going to" para planes e intenciones previas. El Present Continuous también puede usarse para arreglos fijos (citas o reuniones confirmadas).',
        meanings: [
          { term: 'Will', definition: 'Futuro para predicciones, promesas o decisiones rápidas.' },
          { term: 'Going to', definition: 'Futuro para planes e intenciones ya decididas.' },
          { term: 'Arrangement', definition: 'Un plan fijo o cita confirmada (Present Continuous).' }
        ],
        exercises: [
          { question: 'He ____ be here soon.', options: ['will', 'going to', 'is going', 'is'], correct: 0 },
          { question: 'We ____ badminton this afternoon. (Fixed arrangement)', options: ['play', 'will play', 'are playing', 'going to play'], correct: 2 },
          { question: 'I ____ engineering when I leave school. (Intention)', options: ['will study', 'am going to study', 'study', 'studying'], correct: 1 },
          { question: 'I don\'t think it ____ tomorrow.', options: ['rains', 'is raining', 'will rain', 'going to rain'], correct: 2 },
          { question: 'Are you ____ to the cinema tonight?', options: ['go', 'goes', 'going', 'will go'], correct: 2 }
        ]
      },
      {
        title: 'Grammar Review: Sentence Structure',
        description: 'Orden de las palabras y corrección de errores comunes.',
        explanation: 'En inglés, el orden de las palabras es fundamental: Sujeto + Adverbio + Verbo + Complemento. Es importante recordar el uso de la partícula "to" con "going" y no confundir modales con auxiliares.',
        meanings: [
          { term: 'Word Order', definition: 'La estructura correcta de una oración (Sujeto+Verbo+Objeto).' },
          { term: 'Correction', definition: 'Identificar y arreglar errores gramaticales comunes.' },
          { term: 'Phrasal verbs', definition: 'Verbos compuestos como "settle down" o "touch down".' }
        ],
        exercises: [
          { question: 'Order: tennis / on / I / Saturdays / play / usually', options: ['I play tennis usually on Saturdays.', 'I usually play tennis on Saturdays.', 'Usually play I tennis on Saturdays.', 'Saturdays I play usually tennis.'], correct: 1 },
          { question: 'Correct the mistake: "I\'m going travel around the world."', options: ['I go to travel...', 'I am going to travel...', 'I will going travel...', 'I going travel...'], correct: 1 },
          { question: 'Correct: "The plane is going touching down in Paris."', options: ['The plane is going touch down...', 'The plane is going to touch down...', 'The plane will touching down...', 'The plane goes to touch down...'], correct: 1 },
          { question: 'Correct: "She won\'t got here in time."', options: ['She won\'t get here...', 'She won\'t to get here...', 'She doesn\'t got here...', 'She is not get here...'], correct: 0 },
          { question: 'Order: never / to / They\'ve / England / been', options: ['They\'ve been to England never.', 'Never they\'ve been to England.', 'They\'ve never been to England.', 'They never been to England.'], correct: 2 }
        ]
      }
    ]
  },
  {
    id: 'matematica',
    name: 'Matemática',
    icon: 'Calculator',
    color: 'violet',
    description: 'Exploración de los números naturales, sus operaciones, propiedades y el fascinante mundo de la divisibilidad.',
    units: [
      {
        title: 'Números Naturales y Operaciones',
        description: 'Definición de números naturales. Propiedades de la suma y multiplicación.',
        explanation: 'Los números naturales son los que usamos para contar objetos reales. La suma y la multiplicación son operaciones fundamentales. Tienen propiedades como la Conmutativa (5+2 = 2+5) y la Asociativa ((1+2)+3 = 1+(2+3)).',
        meanings: [
          { term: 'Cociente', definition: 'El resultado de una división.' },
          { term: 'Resto', definition: 'Lo que sobra en una división inexacta.' },
          { term: 'Materia', definition: 'Todo lo que tiene masa y ocupa espacio (relación con problemas reales).' }
        ],
        exercises: [
          { question: '¿Qué números forman el conjunto de los Naturales (N)?', options: ['N={1,2,3...}', 'N={0,1,2,3...}', 'N={-1,0,1...}', 'N={2,4,6...}'], correct: 1 },
          { question: '¿Cuál es la propiedad que dice que a+b = b+a?', options: ['Asociativa', 'Distributiva', 'Conmutativa', 'Neutro'], correct: 2 },
          { question: 'En la división D = d·c + r, ¿qué representa la "D"?', options: ['Divisor', 'Dividendo', 'Cociente', 'Resto'], correct: 1 },
          { question: '¿Cuál es el elemento neutro de la multiplicación?', options: ['0', '1', '10', '-1'], correct: 1 },
          { question: '¿Cuándo una división es exacta?', options: ['Cuando el resto es 1', 'Cuando el divisor es 0', 'Cuando el resto es 0', 'Siempre'], correct: 2 }
        ]
      },
      {
        title: 'Potencias y Orde de Prioridad',
        description: 'Propiedades de las potencias y el orden correcto para resolver operaciones combinadas.',
        explanation: 'Una potencia es multiplicar la base por sí misma tantas veces como diga el exponente. Para resolver una cuenta larga (operación combinada), el orden es sagrado: 1° Paréntesis, 2° Potencias/Raíces, 3° Multiplicación/División, 4° Suma/Resta.',
        meanings: [
          { term: 'Base', definition: 'El número que se multiplica repetidamente.' },
          { term: 'Exponente', definition: 'Indica cuántas veces se multiplica la base.' },
          { term: 'JERARQUÍA', definition: 'Orden de importancia para resolver cuentas.' }
        ],
        exercises: [
          { question: '¿Cuánto es cualquier número (distinto de 0) elevado a la 0?', options: ['0', '1', 'El mismo número', 'Infinito'], correct: 1 },
          { question: 'Al multiplicar potencias de igual base (aⁿ · aᵐ), los exponentes se:', options: ['Restan', 'Multiplican', 'Suman', 'Dividen'], correct: 2 },
          { question: 'En operaciones combinadas, ¿qué se debe resolver primero?', options: ['Sumas', 'Potencias', 'Paréntesis', 'Multiplicaciones'], correct: 2 },
          { question: '¿Cuál es la base en la potencia 3⁴?', options: ['3', '4', '81', '12'], correct: 0 },
          { question: '¿Cómo se resuelve (a·b)ˣ?', options: ['a+b+x', 'aˣ · bˣ', 'a·b·x', 'aˣ + bˣ'], correct: 1 }
        ]
      }
    ]
  }
];
