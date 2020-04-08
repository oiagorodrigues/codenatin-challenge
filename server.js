'use strict';

const axios = require('axios');
const fs = require('fs');

const url = 'https://api.codenation.dev/v1/challenge/dev-ps/generate-data?token=b0b5a0bd9a583856db61e4f7e1d90ec1a2d6289e';

(async function main() {
  try {
    const { data } = await axios.get(url);
    saveAnswer(data);
    decryptAnswer(data);
    // sendAnswer();
  } catch (error) {
    throw error;
  }
})();

function saveAnswer(answer) {
  const stringfiedData = JSON.stringify(answer, null, 2);
  fs.writeFile('answer.json', stringfiedData, function writeJSON(err) {
    if (err) return console.log(err);
  });
}

function sendAnswer() {}

const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'w', 'x', 'y', 'z'];

function decryptAnswer(answer) {
  const { numero_casas, cifrado } = answer;
  const REGEX_ALPHABET = /[a-z]/i;
  let decryptedAnswer = '';
  let answerDictionary = {};
  for (let cifra of cifrado) {
    if (!REGEX_ALPHABET.test(cifra)) {
      decryptedAnswer += cifra;
    } else if (answerDictionary[cifra]) {
      decryptedAnswer += answerDictionary[cifra];
    } else {
      const indexValorReal = alphabet.indexOf(cifra) - numero_casas;
      const valorReal = indexValorReal < 0 ? alphabet[alphabet.length + indexValorReal] : alphabet[indexValorReal];
      decryptedAnswer += valorReal;
      answerDictionary[cifra] = valorReal;
    }
  }
  saveAnswer({
    ...answer,
    decifrado: decryptedAnswer,
  });
}
