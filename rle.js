'use strict'
const fs = require('fs')
//const args = process.argv
//const args = [0, 0, "--esc", "-d", "out", "123"]
const args = [0, 0, "--esc", "-e", "Test.txt", "out"]
const esc = 27
const escnull = 0

function escapeEncode(bytesArray) {
    if (bytesArray.length === 0) return ""
    let result = []
    for (let i = 0; i < bytesArray.length; i++) {
        let temp = bytesArray[i]
        let tempArray = []
        if (temp === esc) {
            result.push(escnull, escnull, esc)
            continue
        } else {
            tempArray.push(bytesArray[i])
            let count = 1
            while (i + 1 !== bytesArray.length && bytesArray[i] === bytesArray[i + 1]) {
                count++
                i++
                tempArray.push(bytesArray[i])
                if (count === 259) break
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
        if (data[i] === escnull && data[i + 1] === escnull && data[i + 2] === esc) {
            result.push(esc)
            i += 2
        } else if (data[i] === esc) {
            for (let j = 0; j < data[i + 2] + 4; j++) result.push(data[i + 1])
            i += 2
        } else result.push(data[i])
    }
    return Buffer.from(result)
}

function jumpEncode(data) {
    let result = []
    let tempArray = []
    let count = -1
    let flag = false

    for (let i = 0; i < data.length; i++) {

        if (count === 127) {
            result.push(count)
            tempArray.forEach(e => result.push(e))
            count = -1
            tempArray = []
        }

        if (count !== -1 && i !== data.length + 1 && data[i] === data[i + 1] && data[i + 1] === data[i + 2]) {
            result.push(count)
            tempArray.forEach(e => result.push(e))
            tempArray = []
            count = -1
        }

        tempArray.push(data[i])
        while (i + 1 !== data.length && data[i] === data[i + 1] && data[i + 1] === data[i + 2]) {
            flag = true
            count++
            i++
        }

        if (flag === true) {
            result.push(count + 127, tempArray[0])
            tempArray = []
            count = -1
            i++
            flag = false
            continue
        }

        count++
    }
    if (count !== -1) {
        result.push(count)
        tempArray.forEach(e => result.push(e))
    }
    return Buffer.from(result)
}

function jumpDecode(data) {
    let result = []
    for (let i = 0; i < data.length; i++) {
        if (data[i] < 128) {
            for (let j = i + 1; j < data[i] + 2; j++) {
                result.push(data[j])
            }
            i += data[i] + 1
        } else {
            for (let j = 0; j < data[i] - 124; j++) {
                result.push(data[i + 1])
            }
            i++
        }
    }
    return Buffer.from(result)
}

if (args[2] === "--esc") {
    let result

    if (args[3] === "-e") {
        result = escapeEncode(fs.readFileSync(args[4]))
    } else if (args[3] === "-d") result = escapeDecode(fs.readFileSync(args[4]))

    fs.writeFile(args[5], result, function (err) {
        if (err !== null) console.log(err)
    })
} else if (args[2] === "--jump") {
    let result
    if (args[3] === "-e") {
        let str = Buffer.from(fs.readFileSync(args[4]))
        result = jumpEncode(str)
    } else if (args[3] === "-d") {
        result = jumpDecode(fs.readFileSync(args[4]))
    }

    fs.writeFile(args[5], result, function (err) {
        if (err !== null) console.log(err)
    })
}

if (args[2] === "-c") {
    let f1 = fs.readFileSync(args[3])
    let f2 = fs.readFileSync(args[4])
    console.log(f1.equals(f2))
}
