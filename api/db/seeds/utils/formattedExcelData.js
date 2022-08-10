const readXlsxFile  = require('read-excel-file/node')
const {readSheetNames} = require('read-excel-file/node')
const remove_duplicates_in_array_of_objects = require("./removeDuplicatesInArrayOfObjects")
const hasNumber = /\d/;   
const isInUpperCase = (str) => {
  return str === str.toUpperCase()
}

// probably some other way to do this
// but works and is just for seeding (initial data)
// clients should never reach this function
const funct = async () => {
  const sheets_quantity = (await readSheetNames('api/db/seeds/real/timetables.xlsx')).length - 1
  const subject_teacher = []
  for (let i = 1; i <= sheets_quantity; i++) {
    const data = await readXlsxFile("api/db/seeds/real/timetables.xlsx", { sheet: i })
    for (let j = 0; j < data.length; j++) {
      for (let k = 0; k < data[j].length; k++) {
        // subject is always the longest word that is in capital letters
        const subject = data[j][k] && data[j][k].split?.(/\n/).reduce((a, b) => b && !hasNumber.test(b) && isInUpperCase(b) && b.length > a.length ? b.trim().replaceAll(".", "")  : a , "")       
        const teachers = data[j][k] && data[j][k]?.split?.("(")[1]?.split?.(")")[0]?.split?.("/").flat().flatMap(x => x.split(" - ")).filter(
          // exceptions
         x => x !== "No presencial" && x !== " " && !x.includes("-") && x !== "Proyecto" && x
         )
      if(teachers && teachers.length !== 0 && subject) {
        teachers.forEach(t => {
          subject_teacher.push({
            subject: [...subject].map((el, i) => i !== 0 ? el.toLowerCase() : el).join("").replaceAll("ciclo sup", "").trim(),
            teacher: t.trim()
              })
        });
      }              
      }
    }
    //return {subject_teacher, subjects: [...new Set(subject_teacher.map(x => x.subject))]}
  }
  console.log({subject_teacher: remove_duplicates_in_array_of_objects(subject_teacher), subjects: [...new Set(subject_teacher.map(x => x.subject))]})
  }
funct()

module.exports = funct()
