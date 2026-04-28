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
          { question: '¿Qué intercambia un sistema abierto?', options: ['Nada', 'Solo energía', 'Materia y energía', 'Solo materia'], correct: 2 }
        ]
      },
      {
        title: 'Biomoléculas: Lípidos y Proteínas',
        description: 'Funciones energéticas, estructurales y reguladoras de las moléculas de la vida.',
        exercises: [
          { question: '¿Cuál es una función de los lípidos?', options: ['Transporte de oxígeno', 'Reserva de energía', 'Código genético', 'Digestión'], correct: 1 }
        ]
      },
      {
        title: 'Hidratos de Carbono y ADN',
        description: 'Glúcidos para energía rápida y ácidos nucleicos para la herencia genética.',
        exercises: [
          { question: '¿Qué molécula contiene la información genética?', options: ['Glucosa', 'Lípido', 'ADN', 'Almidón'], correct: 2 }
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
          { question: '¿Qué diferencia a la Población de la Sociedad en Geografía?', options: ['Son sinónimos', 'Población es el grupo; Sociedad comparte vivencias y cultura', 'Sociedad es solo para ciudades', 'Población es para animales'], correct: 1 }
        ]
      },
      {
        title: 'Esfera Terrestre y Líneas Imaginarias',
        description: 'Eje terrestre (23° 27\'), Paralelos (Ecuador, Trópicos, Círculos Polares) y Meridianos (Greenwich, Antimeridiano).',
        exercises: [
          { question: '¿Qué meridiano divide la Tierra en hemisferio Oriental y Occidental?', options: ['Ecuador', 'Círculo Polar', 'Meridiano de Greenwich', 'Trópico de Cáncer'], correct: 2 }
        ]
      },
      {
        title: 'Orientación y Coordenadas',
        description: 'Localización absoluta mediante Latitud (distancia al Ecuador) y Longitud (distancia a Greenwich). Localización relativa.',
        exercises: [
          { question: '¿De dónde a dónde se mide la Longitud?', options: ['De Norte a Sur', 'De Este a Oeste (desde Greenwich)', 'Del Ecuador a los Polos', 'De la base a la cima'], correct: 1 }
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
          { question: '¿Cuál es el "puente" que une el presente con el pasado según Benedetto Croce?', options: ['Los libros', 'La memoria', 'Toda historia es historia del presente', 'Los museos'], correct: 2 }
        ]
      },
      {
        title: 'Poblamiento de América',
        description: 'Teorías sobre el origen del hombre americano: Asiática (Bering), Oceánica y Australiana.',
        exercises: [
          { question: '¿Qué teoría propuso que el hombre cruzó por el Estrecho de Bering?', options: ['Teoría Oceánica', 'Teoría Asiática', 'Teoría Australiana', 'Teoría Autoctonista'], correct: 1 }
        ]
      },
      {
        title: 'Civilización Caral',
        description: 'La civilización más antigua de América (3000 a.C.). Urbanismo planificado y quipus.',
        exercises: [
          { question: '¿Hace cuántos años surgió la civilización de Caral?', options: ['1000 años', '2000 años', '5000 años', '10000 años'], correct: 2 }
        ]
      },
      {
        title: 'Egipto y Grecia',
        description: 'Primeros estados, escritura, religión politeísta y el origen de la democracia en Atenas.',
        exercises: [
          { question: '¿En qué ciudad griega nació la Democracia?', options: ['Esparta', 'Atenas', 'Micenas', 'Corinto'], correct: 1 }
        ]
      },
      {
        title: 'Roma e Invasiones',
        description: 'De la Monarquía a la República y el Imperio. La caída de Roma y las sociedades medievales.',
        exercises: [
          { question: '¿En qué año cayó el Imperio Romano de Occidente?', options: ['310 d.C.', '476 d.C.', '1453 d.C.', '1789 d.C.'], correct: 1 }
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
          { question: '¿Cuál es la libertad relacionada con pensamientos y deseos propios?', options: ['Libertad Social', 'Libertad Política', 'Libertad Individual', 'Libertad Económica'], correct: 2 }
        ]
      },
      {
        title: 'Las Normas',
        description: 'Reglas para la convivencia. Tipos: sociales, morales, culturales y jurídicas.',
        exercises: [
          { question: '¿Qué tipo de normas son los "usos y costumbres" como saludar?', options: ['Morales', 'Sociales', 'Jurídicas', 'Religiosas'], correct: 1 }
        ]
      },
      {
        title: 'La Constitución Nacional',
        description: 'Ley Suprema de Argentina. Derechos, deberes y garantías fundamentales.',
        exercises: [
          { question: '¿Cómo se llama la introducción de la Constitución Nacional?', options: ['Declaración', 'Garantía', 'Preámbulo', 'Artículo 1'], correct: 2 }
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
          { question: 'Complete: "I ____ (watch) TV when he arrived."', options: ['watch', 'am watching', 'watched', 'was watching'], correct: 3 }
        ]
      },
      {
        title: 'Vocabulary: Environment',
        description: 'Words related to ecology, pollution, and recycling.',
        exercises: [
          { question: 'What does "Pollution" mean?', options: ['Limpieza', 'Contaminación', 'Reciclaje', 'Naturaleza'], correct: 1 }
        ]
      }
    ]
  }
];
