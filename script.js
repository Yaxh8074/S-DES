// Permutation helper function
function permute(original, permutation_table) {
    return permutation_table.map(i => original[i - 1]).join('');
}

// XOR function
function xor(bits1, bits2) {
    return bits1.split('').map((b, i) => (b === bits2[i] ? '0' : '1')).join('');
}

// Left shift
function leftShift(bits, shifts) {
    return bits.slice(shifts) + bits.slice(0, shifts);
}

// S-Boxes
const S0 = [[1, 0, 3, 2], [3, 2, 1, 0], [0, 2, 1, 3], [3, 1, 3, 2]];
const S1 = [[0, 1, 2, 3], [2, 0, 1, 3], [3, 0, 1, 0], [2, 1, 0, 3]];

// S-Box function
function sbox(bits, sbox) {
    const row = parseInt(bits[0] + bits[3], 2);
    const col = parseInt(bits[1] + bits[2], 2);
    return sbox[row][col].toString(2).padStart(2, '0');
}

// Key generation
function keyGeneration(key) {
    const P10 = [3, 5, 2, 7, 4, 10, 1, 9, 8, 6];
    const P8 = [6, 3, 7, 4, 8, 5, 10, 9];

    let permutedKey = permute(key, P10);
    let left = permutedKey.slice(0, 5);
    let right = permutedKey.slice(5);

    left = leftShift(left, 1);
    right = leftShift(right, 1);
    const key1 = permute(left + right, P8);

    left = leftShift(left, 2);
    right = leftShift(right, 2);
    const key2 = permute(left + right, P8);

    return { key1, key2 };
}

// fk function
function fk(bits, key) {
    const EP = [4, 1, 2, 3, 2, 3, 4, 1];
    const P4 = [2, 4, 3, 1];

    let left = bits.slice(0, 4);
    let right = bits.slice(4);
    right = permute(right, EP);

    const rightXor = xor(right, key);
    const sboxLeft = sbox(rightXor.slice(0, 4), S0);
    const sboxRight = sbox(rightXor.slice(4), S1);

    const sboxOutput = permute(sboxLeft + sboxRight, P4);
    return xor(left, sboxOutput) + bits.slice(4);
}

// Encrypt function
function encrypt() {
    const plainText = document.getElementById('plain-text').value;
    const key = document.getElementById('key').value;

    if (plainText.length !== 8 || key.length !== 10) {
        alert('Plain text must be 8 bits and key must be 10 bits.');
        return;
    }

    const { key1, key2 } = keyGeneration(key);

    const IP = [2, 6, 3, 1, 4, 8, 5, 7];
    const IP_inv = [4, 1, 3, 5, 7, 2, 8, 6];

    let permutedText = permute(plainText, IP);
    let result = fk(permutedText, key1);
    result = result.slice(4) + result.slice(0, 4);
    result = fk(result, key2);

    const cipherText = permute(result, IP_inv);
    document.getElementById('output-text').innerText = `Cipher Text: ${cipherText}`;
}

// Decrypt function (reverse keys)
function decrypt() {
    const cipherText = document.getElementById('plain-text').value;
    const key = document.getElementById('key').value;

    if (cipherText.length !== 8 || key.length !== 10) {
        alert('Cipher text must be 8 bits and key must be 10 bits.');
        return;
    }

    const { key1, key2 } = keyGeneration(key);

    const IP = [2, 6, 3, 1, 4, 8, 5, 7];
    const IP_inv = [4, 1, 3, 5, 7, 2, 8, 6];

    let permutedText = permute(cipherText, IP);
    let result = fk(permutedText, key2);
    result = result.slice(4) + result.slice(0, 4);
    result = fk(result, key1);

    const plainText = permute(result, IP_inv);
    document.getElementById('output-text').innerText = `Plain Text: ${plainText}`;
}
