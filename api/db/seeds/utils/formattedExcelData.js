const readXlsxFile = require('read-excel-file/node')
const { readSheetNames } = require('read-excel-file/node')
const remove_duplicates_in_array_of_objects = require('./removeDuplicatesInArrayOfObjects')
const hasNumber = /\d/
const isInUpperCase = (str) => {
  return str === str.toUpperCase()
}
const correctSubjectsNames = {
  "ED FÍSICA": "Educación física",
  "TRAB Y CIUD": "Trabajo y ciudadanía",
  "CIENCIAS DE LA COMUNIC": "Ciencias de la comunicación",
  "PROY. DE INVESTIGACIÓN": "Proyecto de investigación",
  "PROY DE INV": "Proyecto de investigación",  
  "FORM ÉTICA": "Formación ética",
  "FISICO - QUÍMICA": "Físico - química",
  "FORMACIÓN      ÉTICA": "Formación ética",
  "FORMACIÓN   ÉTICA": "Formación ética",
  "INT FÍSICA": "Introducción a la física",
  "INT QUÍMICA": "Introducción a la química",
  "SALUD Y AD": "Salud y adolescencia",
  "LAB DE CS AMBIENTALES": "Laboratorio de ciencias ambientales",
  "FUND QUÍMICA": "Fundamentos de la química",
  "OBSERVATORIO DE COMU CULT Y SOCIEDAD": "Observatorio de comunicación, cultura y sociedad",
  "COMU Y CULT DE CONSUMO": "Comunicación y cultura de consumo",
  "COM CULT Y SOCIEDAD": "Comunicación, cultura y sociedad",
  "COM CULT Y SOC": "Comunicación, cultura y sociedad",
  "PROY DE INVESTIGACIÓN": "Proyecto de investigación",
  "LAB CS AMBIENTALES": "Laboratorio de ciencias ambientales",
  "LABORATORIO  FÍSICO-QUÍMICA": "Laboratorio de físico-química",
  "POLÍTICA Y C": "Política y ciudadanía",
  "FORMACIÓN": "Formación ética",	
  "FORMACION ÉTICA": "Formación ética",
}
const teacherNamesCorrections = {
  "Monzón H., C.": "Monzón H, C",
  "Monzón H C": "Monzón H, C",
  "Iriarte,M.Belen": "Iriarte, Belén",
  "Gorostegui V., M.": "Gorostegui V, M",
  "Monzón H., M.": "Monzón H, M",
  "Monzón, H, M": "Monzón H, M",
  "Rodrigues C": "Rodrigues, C",
  "Rodrigues C.": "Rodrigues, C",
  "López": "Lópéz, N",
  "López Beneites": "López Beneitez",
  "Buffa, J, M.": "Buffa, J M",
}
// probably some other way to do this
// but works and is just for seeding (initial data)
// clients should never reach this function
const funct = async () => {
  const sheets = await readSheetNames('../db/seeds/real/timetables.xlsx')
  // remove last
  sheets.pop()
  const sheets_quantity = sheets.length
  const subject_teacher = []
  const slots = sheets.map(el => ({
    class: el,
    slots: [
      {
        weekday: 'Lunes',
        assignments: []
      },
      {
        weekday: 'Martes',
        assignments: []
      },
      {
        weekday: 'Miércoles',
        assignments: []
      },
      {
        weekday: 'Jueves',
        assignments: []
      },
      {
        weekday: 'Viernes',
        assignments: []
      }
    ]
  }))
  const transformationForExtraShiftsException = (el) => el.includes("PLÁSTICA - TEATRO") ? el.split(" - ") : el  
  for (let i = 1; i < sheets_quantity; i++) {
    const data = await readXlsxFile('../db/seeds/real/timetables.xlsx', { sheet: i })
    for (let j = 0; j < data.length; j++) {
      for (let k = 0; k < data[j].length; k++) {
       data[j][k] = typeof data[j][k] === "string" && data[j][k].replaceAll("(A - B)", "").replaceAll("(B - A)", "").replaceAll("(A-B)", "").replaceAll("(B-A)", "").replaceAll("(a - b)", "").replaceAll("(b - a)", "")
        // subject is always the longest word that is in capital letters
      let subjects = (data[j][k] && typeof data[j][k] === "string") && data[j][k].replace(/ {3,}/g,'\n').replaceAll(" (", "\n (").split?.(/\n/).filter((el) => el && !hasNumber.test(el) && isInUpperCase(el))
      .flatMap(el => {
       return transformationForExtraShiftsException(el.trim().replaceAll('.', '')) 
      })
        subjects = subjects
          ? subjects.map(subject => (correctSubjectsNames[subject] ||  
          [...subject].map((el, i) => i !== 0 ? el.toLowerCase() : el).join('').replaceAll('ciclo sup', '').trim()))
          : false

        // bidimensional array
        // first level: teachers that share subject, second level: each teacher
        const teachers = data[j][k] && data[j][k]?.split?.('\n')
        .filter(el => el.includes("(") && el.includes(")") && el !== '(No presencial)' && el !== '( )' && !el.includes('Proyecto') && !hasNumber.test(el) && el)
        ?.map?.(el => el.match(/\(([^()]*)\)/g).map(($0) => $0.substring(1,$0.length-1)))
      ?.flatMap?.(el2 => el2?.map(el => el?.split?.(/ \/ | - /).map?.(el => teacherNamesCorrections[el] || el)))
      .filter((el) => el && el.length > 0)

      if(subjects && subjects.includes("Teatro") && subjects.includes("Plástica") && subjects.length === 2 && teachers.length === 1){
        teachers.push([teachers[0].at(-1)])  
        teachers[0].pop()
      }
      if (teachers && teachers.length !== 0 && subjects.length > 0) {
          teachers.forEach((tArr, idx) => {
            tArr.forEach(t => {
              subject_teacher.push({
              subject: subjects[idx],
              teacher: t.trim().replaceAll(".", "").replaceAll("?", "")
             })
            })
          })
          if (k > 1 && data[j][1] && slots[i - 1]) {
              let [start_time, end_time] = data[j][1].replaceAll('.', ':').split('/')
              subjects.forEach((subject, idx) => {
                const indexSubjectIfExists = slots[i - 1].slots[k - 2].assignments.findIndex(el => el.subject === subject)
                if (indexSubjectIfExists !== -1) {
                  slots[i - 1].slots[k - 2].assignments[indexSubjectIfExists].end_time = end_time
                  return
                }
                if(!teachers[idx]) {
                  return
                }
                slots[i - 1].slots[k - 2].assignments.push({
                  subject,
                  start_time,
                  end_time,
                  teachers: teachers[idx].map(el => el.trim().replaceAll(".", "").replaceAll("?", ""))
                })})
              }
        }
      }
    }
  }
  return {
    subject_teacher: remove_duplicates_in_array_of_objects(subject_teacher),
    subjects: [...new Set(subject_teacher.map(x => x.subject))],
    classes: slots.map(x => x.class),
    slots
  }
}

module.exports = funct()
