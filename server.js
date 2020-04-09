'use strict';

const axios = require('axios');
const fs = require('fs');
const crypto = require('crypto');
const FormData = require('form-data');
const JSONStream = require('JSONStream');
const api = 'https://api.codenation.dev/v1/challenge/dev-ps';
const token = 'b0b5a0bd9a583856db61e4f7e1d90ec1a2d6289e';

(async function main() {
  try {
    const { data } = await axios.get(api + `/generate-data?token=${token}`);
    saveAnswer(data);
    decryptAnswer(data);
    hashAnswer();
  } catch ({ response }) {
    console.log(response.data.message);
  }
})();

function saveAnswer(answer) {
  const stringfiedData = JSON.stringify(answer, null, 2);
  fs.writeFileSync('answer.json', stringfiedData);
}

async function sendAnswer() {
  const form = new FormData();
  form.append('answer', fs.createReadStream('answer.json'));

  try {
    const res = await axios.post(api + `/submit-solution?token=${token}`, form, {
      headers: form.getHeaders(),
    });
    console.log('data sent response: ', res);
  } catch ({ response }) {
    console.error(response.data.message);
  }
}

function hashAnswer() {
  fs.readFile('answer.json', async (err, data) => {
    if (err) {
      console.log(err);
      return;
    }

    const answer = JSON.parse(data);

    answer.resumo_criptografico = await crypto
      .createHash('sha1')
      .update(answer.decifrado)
      .digest('hex');

    await saveAnswer(answer);

    sendAnswer();
  });
}

const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

async function decryptAnswer(answer) {
  const { numero_casas, cifrado } = answer;

  const REGEX_ALPHABET = /[a-z]/i;
  let answerDictionary = {};
  const cryptedValue = cifrado.split('');

  const decryptedAnswer = cryptedValue.reduce((decrypted, cifra) => {
    if (!REGEX_ALPHABET.test(cifra)) {
      return decrypted + cifra;
    }
    if (answerDictionary[cifra]) {
      return decrypted + answerDictionary[cifra];
    }

    const decryptedValueIndex = alphabet.indexOf(cifra) - numero_casas;
    const valorReal = decryptedValueIndex < 0 ? alphabet[alphabet.length + decryptedValueIndex] : alphabet[decryptedValueIndex];
    answerDictionary[cifra] = valorReal;
    return decrypted + valorReal;
  }, '');

  saveAnswer({
    ...answer,
    decifrado: decryptedAnswer,
  });
}
