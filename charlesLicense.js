class Extend {
    static reverseBinary(input) {
        return input.split('').map(i => i === '0' ? '1': '0').join('');
    }

    static int2long(input) {
        let b = input.toString(2);
        if (b.charAt(0) === '-') {
            b = b.substring(1, b.length);
            b = Extend.reverseBinary(b);
            b = Extend.addBinary(b, '1');
            b = b.padStart(64, '1');
        }
        return BigInt('0b' + b);
    }

    static long2int(input) {
        let b = input.toString(2);
        if (b.charAt(0) === '-') {
            b = b.substring(1, b.length);
            b = b.padStart(64, '0');
            b = Extend.reverseBinary(b);
            b = Extend.addBinary(b, '1');
        } else {
            b = b.padStart(64, '0');
        }
        b = b.substring(b.length - 32, b.length);
        return Extend.binary2Number(b);
    }

    static binary2Number(binary) {
        let f = 1;
        if (binary.charAt(0) === '1') {
            f = -1;
            binary = Extend.reverseBinary(binary);
            binary = Extend.addBinary(binary, '1');
        }
        return f * Number('0b' + binary);
    }

    static longZeroFillRightShift(input, n) {
        if (input >= 0) {
            return input >> BigInt(n);
        }
        input *= -1n;
        let b = input.toString(2);
        b = b.padStart(64, '0');
        b = Extend.reverseBinary(b);
        b = Extend.addBinary(b, '1');
        b = b.substring(0, b.length - n);
        b = b.padStart(64, '0');
        return BigInt('0b' + b);
    }

    static intLeftShift(input, n) {
        let b = input.toString(2);
        if (b.charAt(0) === '-') {
            b = b.substring(1, b.length);
            b = b.padStart(32, '0');
            b = Extend.reverseBinary(b);
            b = Extend.addBinary(b, '1');
        } else {
            b = b.padStart(32, '0');
        }
        b = b + '0'.repeat(n);
        b = b.substring(b.length - 32, b.length);
        return Extend.binary2Number(b.substring(b.length - 32, b.length));
    }

    static addBinary(a, b) {
        let res = '';
        let c = 0;
        let _a = a.split('');
        let _b = b.split('');
        while (_a.length || _b.length || c) {
            c += parseInt(_a.pop() || '0') + parseInt(_b.pop() || '0');
            res = c % 2 + res;
            c = c > 1 ? 1 : 0;
        }
        return res;
    }

    static bigint2long(input) {
        let b = input.toString(2);
        if (b.length <= 64) {
            return input;
        }
        b = b.substring(b.length - 64, b.length);
        let s = 1n;
        if (b.charAt(0) === '1') {
            s = -1n;
            b = Extend.reverseBinary(b);
            b = Extend.addBinary(b, '1');
        }
        return BigInt('0b' + b) * s;
    }

    static nextInt() {
        return Math.floor(Math.random() * 1e10);
    }

    static long2Hex(num) {
        return Extend.num2Hex(num, 64);
    }

    static int2Hex(num) {
        return Extend.num2Hex(num, 32);
    }

    static num2Hex(num, n) {
        if (num >= 0) {
            return num.toString(16);
        }
        let b = num.toString(2);
        b = b.substring(1, b.length);
        b = b.padStart(n, '0');
        b = Extend.reverseBinary(b);
        b = Extend.addBinary(b, '1');
        return BigInt('0b' + b).toString(16);
    }

    static stringToByte(str) {
        let bytes = [];
        let len,
        c;
        len = str.length;
        for (let i = 0; i < len; i++) {
            c = str.charCodeAt(i);
            if (c >= 0x010000 && c <= 0x10FFFF) {
                bytes.push(((c >> 18) & 0x07) | 0xF0);
                bytes.push(((c >> 12) & 0x3F) | 0x80);
                bytes.push(((c >> 6) & 0x3F) | 0x80);
                bytes.push((c & 0x3F) | 0x80);
            } else if (c >= 0x000800 && c <= 0x00FFFF) {
                bytes.push(((c >> 12) & 0x0F) | 0xE0);
                bytes.push(((c >> 6) & 0x3F) | 0x80);
                bytes.push((c & 0x3F) | 0x80);
            } else if (c >= 0x000080 && c <= 0x0007FF) {
                bytes.push(((c >> 6) & 0x1F) | 0xC0);
                bytes.push((c & 0x3F) | 0x80);
            } else {
                bytes.push(c & 0xFF);
            }
        }
        return bytes;
    }
}

class ByteBuffer {
    constructor(cap) {
        this.data = [];
        this.cap = cap;
        this.pos = 0;
        for (let i = 0; i < cap; i++) {
            this.data[i] = '0'.repeat(8);
        }
    }

    putInt(input) {
        return this.putNumber(input, 32);
    }

    putLong(input) {
        return this.putNumber(input, 64);
    }

    putBytes(input) {
        input.forEach(byte => this.putNumber(byte, 8));
        return this;
    }

    putNumber(num, bit) {
        let b = num.toString(2);
        if (num < 0) {
            b = b.substring(1, b.length);
            b = Extend.reverseBinary(b);
            b = Extend.addBinary(b, '1');
            b = b.padStart(bit, '1');
        } else {
            b = b.padStart(bit, '0');
        }
        for (let i = 0; i < bit; i += 8) {
            this.data[this.pos++] = b.substring(i, i + 8);
        }
        return this;
    }

    getLong() {
        let b = '';
        for (let end = this.pos + 8; this.pos < end; this.pos++) {
            b += this.data[this.pos];
        }
        return Extend.bigint2long(BigInt('0b' + b));
    }

    hasRemaining() {
        return this.pos < this.cap;
    }

    rewind() {
        this.pos = 0;
        return this;
    }

    array() {
        return this.data.map(b => Extend.binary2Number(b));
    }
}

class SimpleRC5 {
    constructor(key) {
        this.P32 = Extend.long2int(0xb7e15163n);
        this.Q32 = Extend.long2int(0x9e3779b9n);
        this.R = 12;
        this.S = [];
        this.setKey(key);
    }

    setKey(key) {
        const t = 2 * (this.R + 1);
        const c = 2;

        let L = [];
        L[0] = Extend.long2int(key);
        L[1] = Number(Extend.longZeroFillRightShift(key, 32));

        this.S[0] = this.P32;
        for (let i = 1; i < t; i++) {
            this.S[i] = Extend.long2int(Extend.int2long(this.S[i - 1]) + Extend.int2long(this.Q32));
        }

        let i = 0,
        j = 0,
        A = 0,
        B = 0;

        for (let k = 0; k < 3 * t; k++) {
            A = this.S[i] = this.rotateLeft(this.S[i] + A + B, 3);
            B = L[j] = this.rotateLeft(L[j] + A + B, A + B);
            i = (i + 1) % t;
            j = (j + 1) % c;
        }
    }

    encrypt(input) {
        let A = Extend.long2int(input + Extend.int2long(this.S[0]));
        let B = Extend.long2int(Extend.longZeroFillRightShift(input, 32) + Extend.int2long(this.S[1]));

        for (let i = 1; i <= this.R; i++) {
            A = Extend.long2int(Extend.int2long(this.rotateLeft(A ^ B, B)) + Extend.int2long(this.S[2 * i]));
            B = Extend.long2int(Extend.int2long(this.rotateLeft(B ^ A, A)) + Extend.int2long(this.S[2 * i + 1]));
        }

        return this.asLong(A, B);
    }

    decrypt(input) {
        let A = Extend.long2int(input);
        let B = Extend.long2int(Extend.longZeroFillRightShift(input, 32));

        for (let i = this.R; i > 0; i--) {
            B = this.rotateRight(Extend.long2int(Extend.int2long(B) - Extend.int2long(this.S[2 * i + 1])), A) ^ A;
            A = this.rotateRight(Extend.long2int(Extend.int2long(A) - Extend.int2long(this.S[2 * i])), B) ^ B;
        }

        B = B - this.S[1];
        A = A - this.S[0];

        return this.asLong(A, B);
    }

    rotateLeft(x, y) {
        return (Extend.long2int((Extend.int2long(x) << Extend.int2long(y & 31))) | (x >>> (32 - (y & (32 - 1)))));
    }

    rotateRight(x, y) {
        return ((x >>> (y & (32 - 1))) | Extend.intLeftShift(x, 32 - (y & 31)));
    }

    asLong(a, b) {
        return Extend.bigint2long((Extend.int2long(a) & 0xffffffffn) | (Extend.int2long(b) << 32n));
    }
}

class CharlesKeygen {
    static RC5KEY_NAME = BigInt('0x7a21c951691cd470');
    static RC5KEY_KEY = BigInt('0xb4f0e0ccec0eafad');
    static NAME_PREFIX = BigInt('0x54882f8a');

    static calcPrefix(name) {
        const bytes = Extend.stringToByte(name.replace(/[  \u180e    　]/g, ' '));
        let length = bytes.length + 4;
        let padded = ((~length + 1) & (8 - 1)) + length;
        let input = new ByteBuffer(padded).putInt(bytes.length).putBytes(bytes).rewind();

        let rc5 = new SimpleRC5(this.RC5KEY_NAME);
        let output = new ByteBuffer(padded);
        while (input.hasRemaining()) {
            output.putLong(rc5.encrypt(input.getLong()));
        }

        let n = 0;
        output.array().forEach(b => {
            n = rc5.rotateLeft(n ^ b, 0x3);
        });
        return n;
    }

    static xor(n) {
        let n2 = 0n;
        let tmp = 0xffn;

        for (let i = 56; i >= 0; i -= 8) {
            n2 ^= (Extend.longZeroFillRightShift(n, i) & tmp);
        }
        return Math.abs(Extend.long2int(n2 & tmp));
    }

    static key(prefix, suffix) {
        let input = Extend.bigint2long(Extend.int2long(prefix) << 32n);

        switch (suffix >> 16) {
        case 0x0401:
        case 0x0402:
        case 0x0403:
            input |= Extend.int2long(suffix);
            break;
        default:
            input |= Extend.int2long(0x01000000 | (suffix & 0xffffff));
            break;
        }
        let out = new SimpleRC5(this.RC5KEY_KEY).decrypt(input);
        return Extend.int2Hex(this.xor(input)).padStart(2, '0') + Extend.long2Hex(out).padStart(16, '0');
    }

    static keygen(name, suffix = Extend.nextInt()) {
        let prefix = this.calcPrefix(name) ^ Extend.long2int(this.NAME_PREFIX);
        return this.key(prefix, suffix);
    }
}

// let username = 'test';
// console.log(CharlesKeygen.keygen(username));
function getCharlesLicense(username) {
    return CharlesKeygen.keygen(username)
}
// console.log(getCharlesLicense('test'))
