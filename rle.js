'use strict'
const fs = require('fs')
const args = process.argv
//const args = [0, 0, "--esc", "-d", "out", "123"]
//const args = [0, 0, "--esc", "-e", "", "out"]
const esc = 27
const escnull = 0

function getByteArray(data) {
    let result = [];
    for (let i = 0; i < data.length; i += 2)
        result.push(parseInt('0x' + data[i] + data[i + 1]));
    return result;
}

function escapeEncode(bytesArray) {
    if (bytesArray.length === 0) return ""
    let result = []
    for (let i = 0; i < bytesArray.length; i++) {
        let temp = bytesArray[i]
        let tempArray = []
        if (temp === esc) {
            result.push(escnull, esc)
            c++
        }
        else {
            tempArray.push(bytesArray[i])
            let count = 1
            while (i + 1 !== bytesArray.length && bytesArray[i] === bytesArray[i + 1]) {
                count++
                i++
                tempArray.push(bytesArray[i])
                if (count === 255) break
            }
            if (count > 3) result.push(esc, temp, count - 4)
            else tempArray.forEach(e => result.push(e))
        }
    }

    return Buffer.from(result)
}

function escapeDecode(data) {
    let result = []
    for (let i = 0; i < data.length; i++) {
        if (data[i] === escnull && data[i + 1] === esc) {
            result.push(esc)
            c++
            i++
        } else {
            if (data[i] === esc) {
                for (let j = 0; j < data[i + 2] + 4; j++) result.push(data[i + 1])
                i += 2
            } else result.push(data[i])
        }
    }
    return Buffer.from(result)
}

if (args[2] === "--esc") {
    let result

    if (args[3] === "-e") {
        let bytes = Buffer.from(getByteArray(fs.readFileSync(args[4]).toString('hex')));
        result = escapeEncode(bytes)
    } else if (args[3] === "-d") {
        let str = fs.readFileSync(args[4])
        result = escapeDecode(str)
    }

    fs.writeFile(args[5], result, function (err) {
        if (err !== null) console.log(err)
    })
}

if (args[2] === "-c")
{
    let f1 = fs.readFileSync(args[3])
    let f2 = fs.readFileSync(args[4])
    console.log(f1.equals(f2))
}
