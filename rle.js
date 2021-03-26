'use strict'

const fs = require('fs')
const args = process.argv
let bytes = Buffer.from(fs.readFileSync(args[3]))
const esc = String.fromCharCode('0x1b')


function escapeEncode(bytesArray) {
    if (bytesArray.length === 0) return ""
    let result = []
    for (let i = 0; i < bytesArray.length; i++) {
        let temp = bytesArray[i]
        let tempArray = []
        tempArray.push(bytesArray[i])
        let count = 1
        while (i + 1 !== bytesArray.length && bytes[i] === bytes[i + 1]) {
            count++
            i++
            tempArray.push(bytesArray[i])
            if (count === 255) break
        }
        if (count > 3) result.push(esc, temp, count - 4)
        else tempArray.forEach(e => result.push(e))
    }
    return Buffer.from(result)
}

function escapeDecode(data) {
    let result = []
    for (let i = 0; i < data.length; i++) {
        if (data[i] === esc) {
            for (let j = 0; j < data[i + 2] + 4; j++) result.push(data[i + 1])
            i += 2
        } else result.push(data[i])
    }
    return Buffer.from(result)
}

let result

if (args[1] === "--esc") {
    if (args[2] === "-e") {
        result = escapeEncode
    }
    if (args[2] === "-d") result = escapeDecode

    fs.writeFile(args[3], Buffer.from(encoded), function (err) {
        if (err !== null) console.log(err)
    })
}

let encoded = escapeEncode(bytes)
let decoded = escapeDecode(encoded)

if (bytes.equals(decoded)) console.log("Всё ок")
else console.log("Не ок(")

