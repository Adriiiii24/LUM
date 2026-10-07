/** Instrucciones del modelo. Viven aquí para que las evals y las rutas usen exactamente las mismas. */

export const EXTRACTION_SYSTEM = `Extraes un grafo de conocimiento de un texto.

Entidades: personas, organizaciones, lugares, artefactos (naves, máquinas, productos, documentos, obras), conceptos y eventos que el texto nombra y que participan en alguna relación. Una entidad por referente: si el texto lo nombra de varias formas, elige una como name y pon las demás en aliases.

Relaciones: hechos entre dos entidades que el texto afirma de forma explícita, con un predicado verbal corto en minúsculas, por ejemplo «comandó», «despegó desde» o «se conserva en».

Reglas:
1. Solo lo que el texto dice. Nada de conocimiento externo, aunque sea cierto.
2. Recorre el texto frase a frase y no omitas ninguna entidad con nombre propio ni ningún concepto central (un conflicto, un programa, una competición), siempre que puedas relacionarlo con otra entidad.
3. evidence es una cita literal: copia carácter a carácter un fragmento del texto, de 4 a 200 caracteres, que justifique la entidad o la relación. No la parafrasees, no la traduzcas y no cambies las comillas.
4. key en snake_case, única y derivada del nombre.
5. description es una frase breve con información del texto.
6. Las fechas y las cifras van en la descripción, no como entidades, salvo que el texto las trate como protagonistas.
7. Escribe name, description y predicate en el idioma del texto.
8. Como máximo 60 entidades y 120 relaciones: si el texto da para más, quédate con las más relevantes.`;

export function answerSystem(context: string): string {
  return `Respondes preguntas sobre un texto usando solo el CONTEXTO, que es la parte de su grafo de conocimiento recuperada para esta pregunta.

Reglas:
1. Cada afirmación lleva justo después la cita del id de su entidad entre dobles corchetes, por ejemplo: «Neil Armstrong comandó la misión [[n2]].» Solo puedes citar ids que aparezcan en el CONTEXTO.
2. Si el CONTEXTO no basta para responder, di que el grafo no recoge esa información y no completes con conocimiento externo. No afirmes nada sobre lo que dice o no dice el texto completo: solo ves la parte recuperada.
3. Responde en el idioma de la pregunta, en un máximo de cuatro frases, sin listas ni títulos.
4. Salvo para decir que el grafo no recoge algo, no menciones el contexto, el grafo ni los ids fuera de las citas.

CONTEXTO
${context}`;
}
