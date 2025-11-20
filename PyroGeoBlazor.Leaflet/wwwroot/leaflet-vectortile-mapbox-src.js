"use strict";
var LeafletVectorTileMapbox = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // node_modules/ieee754/index.js
  var require_ieee754 = __commonJS({
    "node_modules/ieee754/index.js"(exports) {
      exports.read = function(buffer, offset, isLE, mLen, nBytes) {
        var e, m;
        var eLen = nBytes * 8 - mLen - 1;
        var eMax = (1 << eLen) - 1;
        var eBias = eMax >> 1;
        var nBits = -7;
        var i = isLE ? nBytes - 1 : 0;
        var d = isLE ? -1 : 1;
        var s = buffer[offset + i];
        i += d;
        e = s & (1 << -nBits) - 1;
        s >>= -nBits;
        nBits += eLen;
        for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {
        }
        m = e & (1 << -nBits) - 1;
        e >>= -nBits;
        nBits += mLen;
        for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {
        }
        if (e === 0) {
          e = 1 - eBias;
        } else if (e === eMax) {
          return m ? NaN : (s ? -1 : 1) * Infinity;
        } else {
          m = m + Math.pow(2, mLen);
          e = e - eBias;
        }
        return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
      };
      exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
        var e, m, c;
        var eLen = nBytes * 8 - mLen - 1;
        var eMax = (1 << eLen) - 1;
        var eBias = eMax >> 1;
        var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
        var i = isLE ? 0 : nBytes - 1;
        var d = isLE ? 1 : -1;
        var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
        value = Math.abs(value);
        if (isNaN(value) || value === Infinity) {
          m = isNaN(value) ? 1 : 0;
          e = eMax;
        } else {
          e = Math.floor(Math.log(value) / Math.LN2);
          if (value * (c = Math.pow(2, -e)) < 1) {
            e--;
            c *= 2;
          }
          if (e + eBias >= 1) {
            value += rt / c;
          } else {
            value += rt * Math.pow(2, 1 - eBias);
          }
          if (value * c >= 2) {
            e++;
            c /= 2;
          }
          if (e + eBias >= eMax) {
            m = 0;
            e = eMax;
          } else if (e + eBias >= 1) {
            m = (value * c - 1) * Math.pow(2, mLen);
            e = e + eBias;
          } else {
            m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
            e = 0;
          }
        }
        for (; mLen >= 8; buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8) {
        }
        e = e << mLen | m;
        eLen += mLen;
        for (; eLen > 0; buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8) {
        }
        buffer[offset + i - d] |= s * 128;
      };
    }
  });

  // node_modules/pbf/index.js
  var require_pbf = __commonJS({
    "node_modules/pbf/index.js"(exports, module) {
      "use strict";
      module.exports = Pbf2;
      var ieee754 = require_ieee754();
      function Pbf2(buf) {
        this.buf = ArrayBuffer.isView && ArrayBuffer.isView(buf) ? buf : new Uint8Array(buf || 0);
        this.pos = 0;
        this.type = 0;
        this.length = this.buf.length;
      }
      Pbf2.Varint = 0;
      Pbf2.Fixed64 = 1;
      Pbf2.Bytes = 2;
      Pbf2.Fixed32 = 5;
      var SHIFT_LEFT_32 = (1 << 16) * (1 << 16);
      var SHIFT_RIGHT_32 = 1 / SHIFT_LEFT_32;
      var TEXT_DECODER_MIN_LENGTH = 12;
      var utf8TextDecoder = typeof TextDecoder === "undefined" ? null : new TextDecoder("utf-8");
      Pbf2.prototype = {
        destroy: function() {
          this.buf = null;
        },
        // === READING =================================================================
        readFields: function(readField, result, end) {
          end = end || this.length;
          while (this.pos < end) {
            var val = this.readVarint(), tag = val >> 3, startPos = this.pos;
            this.type = val & 7;
            readField(tag, result, this);
            if (this.pos === startPos) this.skip(val);
          }
          return result;
        },
        readMessage: function(readField, result) {
          return this.readFields(readField, result, this.readVarint() + this.pos);
        },
        readFixed32: function() {
          var val = readUInt32(this.buf, this.pos);
          this.pos += 4;
          return val;
        },
        readSFixed32: function() {
          var val = readInt32(this.buf, this.pos);
          this.pos += 4;
          return val;
        },
        // 64-bit int handling is based on github.com/dpw/node-buffer-more-ints (MIT-licensed)
        readFixed64: function() {
          var val = readUInt32(this.buf, this.pos) + readUInt32(this.buf, this.pos + 4) * SHIFT_LEFT_32;
          this.pos += 8;
          return val;
        },
        readSFixed64: function() {
          var val = readUInt32(this.buf, this.pos) + readInt32(this.buf, this.pos + 4) * SHIFT_LEFT_32;
          this.pos += 8;
          return val;
        },
        readFloat: function() {
          var val = ieee754.read(this.buf, this.pos, true, 23, 4);
          this.pos += 4;
          return val;
        },
        readDouble: function() {
          var val = ieee754.read(this.buf, this.pos, true, 52, 8);
          this.pos += 8;
          return val;
        },
        readVarint: function(isSigned) {
          var buf = this.buf, val, b;
          b = buf[this.pos++];
          val = b & 127;
          if (b < 128) return val;
          b = buf[this.pos++];
          val |= (b & 127) << 7;
          if (b < 128) return val;
          b = buf[this.pos++];
          val |= (b & 127) << 14;
          if (b < 128) return val;
          b = buf[this.pos++];
          val |= (b & 127) << 21;
          if (b < 128) return val;
          b = buf[this.pos];
          val |= (b & 15) << 28;
          return readVarintRemainder(val, isSigned, this);
        },
        readVarint64: function() {
          return this.readVarint(true);
        },
        readSVarint: function() {
          var num = this.readVarint();
          return num % 2 === 1 ? (num + 1) / -2 : num / 2;
        },
        readBoolean: function() {
          return Boolean(this.readVarint());
        },
        readString: function() {
          var end = this.readVarint() + this.pos;
          var pos = this.pos;
          this.pos = end;
          if (end - pos >= TEXT_DECODER_MIN_LENGTH && utf8TextDecoder) {
            return readUtf8TextDecoder(this.buf, pos, end);
          }
          return readUtf8(this.buf, pos, end);
        },
        readBytes: function() {
          var end = this.readVarint() + this.pos, buffer = this.buf.subarray(this.pos, end);
          this.pos = end;
          return buffer;
        },
        // verbose for performance reasons; doesn't affect gzipped size
        readPackedVarint: function(arr, isSigned) {
          if (this.type !== Pbf2.Bytes) return arr.push(this.readVarint(isSigned));
          var end = readPackedEnd(this);
          arr = arr || [];
          while (this.pos < end) arr.push(this.readVarint(isSigned));
          return arr;
        },
        readPackedSVarint: function(arr) {
          if (this.type !== Pbf2.Bytes) return arr.push(this.readSVarint());
          var end = readPackedEnd(this);
          arr = arr || [];
          while (this.pos < end) arr.push(this.readSVarint());
          return arr;
        },
        readPackedBoolean: function(arr) {
          if (this.type !== Pbf2.Bytes) return arr.push(this.readBoolean());
          var end = readPackedEnd(this);
          arr = arr || [];
          while (this.pos < end) arr.push(this.readBoolean());
          return arr;
        },
        readPackedFloat: function(arr) {
          if (this.type !== Pbf2.Bytes) return arr.push(this.readFloat());
          var end = readPackedEnd(this);
          arr = arr || [];
          while (this.pos < end) arr.push(this.readFloat());
          return arr;
        },
        readPackedDouble: function(arr) {
          if (this.type !== Pbf2.Bytes) return arr.push(this.readDouble());
          var end = readPackedEnd(this);
          arr = arr || [];
          while (this.pos < end) arr.push(this.readDouble());
          return arr;
        },
        readPackedFixed32: function(arr) {
          if (this.type !== Pbf2.Bytes) return arr.push(this.readFixed32());
          var end = readPackedEnd(this);
          arr = arr || [];
          while (this.pos < end) arr.push(this.readFixed32());
          return arr;
        },
        readPackedSFixed32: function(arr) {
          if (this.type !== Pbf2.Bytes) return arr.push(this.readSFixed32());
          var end = readPackedEnd(this);
          arr = arr || [];
          while (this.pos < end) arr.push(this.readSFixed32());
          return arr;
        },
        readPackedFixed64: function(arr) {
          if (this.type !== Pbf2.Bytes) return arr.push(this.readFixed64());
          var end = readPackedEnd(this);
          arr = arr || [];
          while (this.pos < end) arr.push(this.readFixed64());
          return arr;
        },
        readPackedSFixed64: function(arr) {
          if (this.type !== Pbf2.Bytes) return arr.push(this.readSFixed64());
          var end = readPackedEnd(this);
          arr = arr || [];
          while (this.pos < end) arr.push(this.readSFixed64());
          return arr;
        },
        skip: function(val) {
          var type = val & 7;
          if (type === Pbf2.Varint) while (this.buf[this.pos++] > 127) {
          }
          else if (type === Pbf2.Bytes) this.pos = this.readVarint() + this.pos;
          else if (type === Pbf2.Fixed32) this.pos += 4;
          else if (type === Pbf2.Fixed64) this.pos += 8;
          else throw new Error("Unimplemented type: " + type);
        },
        // === WRITING =================================================================
        writeTag: function(tag, type) {
          this.writeVarint(tag << 3 | type);
        },
        realloc: function(min) {
          var length = this.length || 16;
          while (length < this.pos + min) length *= 2;
          if (length !== this.length) {
            var buf = new Uint8Array(length);
            buf.set(this.buf);
            this.buf = buf;
            this.length = length;
          }
        },
        finish: function() {
          this.length = this.pos;
          this.pos = 0;
          return this.buf.subarray(0, this.length);
        },
        writeFixed32: function(val) {
          this.realloc(4);
          writeInt32(this.buf, val, this.pos);
          this.pos += 4;
        },
        writeSFixed32: function(val) {
          this.realloc(4);
          writeInt32(this.buf, val, this.pos);
          this.pos += 4;
        },
        writeFixed64: function(val) {
          this.realloc(8);
          writeInt32(this.buf, val & -1, this.pos);
          writeInt32(this.buf, Math.floor(val * SHIFT_RIGHT_32), this.pos + 4);
          this.pos += 8;
        },
        writeSFixed64: function(val) {
          this.realloc(8);
          writeInt32(this.buf, val & -1, this.pos);
          writeInt32(this.buf, Math.floor(val * SHIFT_RIGHT_32), this.pos + 4);
          this.pos += 8;
        },
        writeVarint: function(val) {
          val = +val || 0;
          if (val > 268435455 || val < 0) {
            writeBigVarint(val, this);
            return;
          }
          this.realloc(4);
          this.buf[this.pos++] = val & 127 | (val > 127 ? 128 : 0);
          if (val <= 127) return;
          this.buf[this.pos++] = (val >>>= 7) & 127 | (val > 127 ? 128 : 0);
          if (val <= 127) return;
          this.buf[this.pos++] = (val >>>= 7) & 127 | (val > 127 ? 128 : 0);
          if (val <= 127) return;
          this.buf[this.pos++] = val >>> 7 & 127;
        },
        writeSVarint: function(val) {
          this.writeVarint(val < 0 ? -val * 2 - 1 : val * 2);
        },
        writeBoolean: function(val) {
          this.writeVarint(Boolean(val));
        },
        writeString: function(str) {
          str = String(str);
          this.realloc(str.length * 4);
          this.pos++;
          var startPos = this.pos;
          this.pos = writeUtf8(this.buf, str, this.pos);
          var len = this.pos - startPos;
          if (len >= 128) makeRoomForExtraLength(startPos, len, this);
          this.pos = startPos - 1;
          this.writeVarint(len);
          this.pos += len;
        },
        writeFloat: function(val) {
          this.realloc(4);
          ieee754.write(this.buf, val, this.pos, true, 23, 4);
          this.pos += 4;
        },
        writeDouble: function(val) {
          this.realloc(8);
          ieee754.write(this.buf, val, this.pos, true, 52, 8);
          this.pos += 8;
        },
        writeBytes: function(buffer) {
          var len = buffer.length;
          this.writeVarint(len);
          this.realloc(len);
          for (var i = 0; i < len; i++) this.buf[this.pos++] = buffer[i];
        },
        writeRawMessage: function(fn, obj) {
          this.pos++;
          var startPos = this.pos;
          fn(obj, this);
          var len = this.pos - startPos;
          if (len >= 128) makeRoomForExtraLength(startPos, len, this);
          this.pos = startPos - 1;
          this.writeVarint(len);
          this.pos += len;
        },
        writeMessage: function(tag, fn, obj) {
          this.writeTag(tag, Pbf2.Bytes);
          this.writeRawMessage(fn, obj);
        },
        writePackedVarint: function(tag, arr) {
          if (arr.length) this.writeMessage(tag, writePackedVarint, arr);
        },
        writePackedSVarint: function(tag, arr) {
          if (arr.length) this.writeMessage(tag, writePackedSVarint, arr);
        },
        writePackedBoolean: function(tag, arr) {
          if (arr.length) this.writeMessage(tag, writePackedBoolean, arr);
        },
        writePackedFloat: function(tag, arr) {
          if (arr.length) this.writeMessage(tag, writePackedFloat, arr);
        },
        writePackedDouble: function(tag, arr) {
          if (arr.length) this.writeMessage(tag, writePackedDouble, arr);
        },
        writePackedFixed32: function(tag, arr) {
          if (arr.length) this.writeMessage(tag, writePackedFixed32, arr);
        },
        writePackedSFixed32: function(tag, arr) {
          if (arr.length) this.writeMessage(tag, writePackedSFixed32, arr);
        },
        writePackedFixed64: function(tag, arr) {
          if (arr.length) this.writeMessage(tag, writePackedFixed64, arr);
        },
        writePackedSFixed64: function(tag, arr) {
          if (arr.length) this.writeMessage(tag, writePackedSFixed64, arr);
        },
        writeBytesField: function(tag, buffer) {
          this.writeTag(tag, Pbf2.Bytes);
          this.writeBytes(buffer);
        },
        writeFixed32Field: function(tag, val) {
          this.writeTag(tag, Pbf2.Fixed32);
          this.writeFixed32(val);
        },
        writeSFixed32Field: function(tag, val) {
          this.writeTag(tag, Pbf2.Fixed32);
          this.writeSFixed32(val);
        },
        writeFixed64Field: function(tag, val) {
          this.writeTag(tag, Pbf2.Fixed64);
          this.writeFixed64(val);
        },
        writeSFixed64Field: function(tag, val) {
          this.writeTag(tag, Pbf2.Fixed64);
          this.writeSFixed64(val);
        },
        writeVarintField: function(tag, val) {
          this.writeTag(tag, Pbf2.Varint);
          this.writeVarint(val);
        },
        writeSVarintField: function(tag, val) {
          this.writeTag(tag, Pbf2.Varint);
          this.writeSVarint(val);
        },
        writeStringField: function(tag, str) {
          this.writeTag(tag, Pbf2.Bytes);
          this.writeString(str);
        },
        writeFloatField: function(tag, val) {
          this.writeTag(tag, Pbf2.Fixed32);
          this.writeFloat(val);
        },
        writeDoubleField: function(tag, val) {
          this.writeTag(tag, Pbf2.Fixed64);
          this.writeDouble(val);
        },
        writeBooleanField: function(tag, val) {
          this.writeVarintField(tag, Boolean(val));
        }
      };
      function readVarintRemainder(l, s, p) {
        var buf = p.buf, h, b;
        b = buf[p.pos++];
        h = (b & 112) >> 4;
        if (b < 128) return toNum(l, h, s);
        b = buf[p.pos++];
        h |= (b & 127) << 3;
        if (b < 128) return toNum(l, h, s);
        b = buf[p.pos++];
        h |= (b & 127) << 10;
        if (b < 128) return toNum(l, h, s);
        b = buf[p.pos++];
        h |= (b & 127) << 17;
        if (b < 128) return toNum(l, h, s);
        b = buf[p.pos++];
        h |= (b & 127) << 24;
        if (b < 128) return toNum(l, h, s);
        b = buf[p.pos++];
        h |= (b & 1) << 31;
        if (b < 128) return toNum(l, h, s);
        throw new Error("Expected varint not more than 10 bytes");
      }
      function readPackedEnd(pbf) {
        return pbf.type === Pbf2.Bytes ? pbf.readVarint() + pbf.pos : pbf.pos + 1;
      }
      function toNum(low, high, isSigned) {
        if (isSigned) {
          return high * 4294967296 + (low >>> 0);
        }
        return (high >>> 0) * 4294967296 + (low >>> 0);
      }
      function writeBigVarint(val, pbf) {
        var low, high;
        if (val >= 0) {
          low = val % 4294967296 | 0;
          high = val / 4294967296 | 0;
        } else {
          low = ~(-val % 4294967296);
          high = ~(-val / 4294967296);
          if (low ^ 4294967295) {
            low = low + 1 | 0;
          } else {
            low = 0;
            high = high + 1 | 0;
          }
        }
        if (val >= 18446744073709552e3 || val < -18446744073709552e3) {
          throw new Error("Given varint doesn't fit into 10 bytes");
        }
        pbf.realloc(10);
        writeBigVarintLow(low, high, pbf);
        writeBigVarintHigh(high, pbf);
      }
      function writeBigVarintLow(low, high, pbf) {
        pbf.buf[pbf.pos++] = low & 127 | 128;
        low >>>= 7;
        pbf.buf[pbf.pos++] = low & 127 | 128;
        low >>>= 7;
        pbf.buf[pbf.pos++] = low & 127 | 128;
        low >>>= 7;
        pbf.buf[pbf.pos++] = low & 127 | 128;
        low >>>= 7;
        pbf.buf[pbf.pos] = low & 127;
      }
      function writeBigVarintHigh(high, pbf) {
        var lsb = (high & 7) << 4;
        pbf.buf[pbf.pos++] |= lsb | ((high >>>= 3) ? 128 : 0);
        if (!high) return;
        pbf.buf[pbf.pos++] = high & 127 | ((high >>>= 7) ? 128 : 0);
        if (!high) return;
        pbf.buf[pbf.pos++] = high & 127 | ((high >>>= 7) ? 128 : 0);
        if (!high) return;
        pbf.buf[pbf.pos++] = high & 127 | ((high >>>= 7) ? 128 : 0);
        if (!high) return;
        pbf.buf[pbf.pos++] = high & 127 | ((high >>>= 7) ? 128 : 0);
        if (!high) return;
        pbf.buf[pbf.pos++] = high & 127;
      }
      function makeRoomForExtraLength(startPos, len, pbf) {
        var extraLen = len <= 16383 ? 1 : len <= 2097151 ? 2 : len <= 268435455 ? 3 : Math.floor(Math.log(len) / (Math.LN2 * 7));
        pbf.realloc(extraLen);
        for (var i = pbf.pos - 1; i >= startPos; i--) pbf.buf[i + extraLen] = pbf.buf[i];
      }
      function writePackedVarint(arr, pbf) {
        for (var i = 0; i < arr.length; i++) pbf.writeVarint(arr[i]);
      }
      function writePackedSVarint(arr, pbf) {
        for (var i = 0; i < arr.length; i++) pbf.writeSVarint(arr[i]);
      }
      function writePackedFloat(arr, pbf) {
        for (var i = 0; i < arr.length; i++) pbf.writeFloat(arr[i]);
      }
      function writePackedDouble(arr, pbf) {
        for (var i = 0; i < arr.length; i++) pbf.writeDouble(arr[i]);
      }
      function writePackedBoolean(arr, pbf) {
        for (var i = 0; i < arr.length; i++) pbf.writeBoolean(arr[i]);
      }
      function writePackedFixed32(arr, pbf) {
        for (var i = 0; i < arr.length; i++) pbf.writeFixed32(arr[i]);
      }
      function writePackedSFixed32(arr, pbf) {
        for (var i = 0; i < arr.length; i++) pbf.writeSFixed32(arr[i]);
      }
      function writePackedFixed64(arr, pbf) {
        for (var i = 0; i < arr.length; i++) pbf.writeFixed64(arr[i]);
      }
      function writePackedSFixed64(arr, pbf) {
        for (var i = 0; i < arr.length; i++) pbf.writeSFixed64(arr[i]);
      }
      function readUInt32(buf, pos) {
        return (buf[pos] | buf[pos + 1] << 8 | buf[pos + 2] << 16) + buf[pos + 3] * 16777216;
      }
      function writeInt32(buf, val, pos) {
        buf[pos] = val;
        buf[pos + 1] = val >>> 8;
        buf[pos + 2] = val >>> 16;
        buf[pos + 3] = val >>> 24;
      }
      function readInt32(buf, pos) {
        return (buf[pos] | buf[pos + 1] << 8 | buf[pos + 2] << 16) + (buf[pos + 3] << 24);
      }
      function readUtf8(buf, pos, end) {
        var str = "";
        var i = pos;
        while (i < end) {
          var b0 = buf[i];
          var c = null;
          var bytesPerSequence = b0 > 239 ? 4 : b0 > 223 ? 3 : b0 > 191 ? 2 : 1;
          if (i + bytesPerSequence > end) break;
          var b1, b2, b3;
          if (bytesPerSequence === 1) {
            if (b0 < 128) {
              c = b0;
            }
          } else if (bytesPerSequence === 2) {
            b1 = buf[i + 1];
            if ((b1 & 192) === 128) {
              c = (b0 & 31) << 6 | b1 & 63;
              if (c <= 127) {
                c = null;
              }
            }
          } else if (bytesPerSequence === 3) {
            b1 = buf[i + 1];
            b2 = buf[i + 2];
            if ((b1 & 192) === 128 && (b2 & 192) === 128) {
              c = (b0 & 15) << 12 | (b1 & 63) << 6 | b2 & 63;
              if (c <= 2047 || c >= 55296 && c <= 57343) {
                c = null;
              }
            }
          } else if (bytesPerSequence === 4) {
            b1 = buf[i + 1];
            b2 = buf[i + 2];
            b3 = buf[i + 3];
            if ((b1 & 192) === 128 && (b2 & 192) === 128 && (b3 & 192) === 128) {
              c = (b0 & 15) << 18 | (b1 & 63) << 12 | (b2 & 63) << 6 | b3 & 63;
              if (c <= 65535 || c >= 1114112) {
                c = null;
              }
            }
          }
          if (c === null) {
            c = 65533;
            bytesPerSequence = 1;
          } else if (c > 65535) {
            c -= 65536;
            str += String.fromCharCode(c >>> 10 & 1023 | 55296);
            c = 56320 | c & 1023;
          }
          str += String.fromCharCode(c);
          i += bytesPerSequence;
        }
        return str;
      }
      function readUtf8TextDecoder(buf, pos, end) {
        return utf8TextDecoder.decode(buf.subarray(pos, end));
      }
      function writeUtf8(buf, str, pos) {
        for (var i = 0, c, lead; i < str.length; i++) {
          c = str.charCodeAt(i);
          if (c > 55295 && c < 57344) {
            if (lead) {
              if (c < 56320) {
                buf[pos++] = 239;
                buf[pos++] = 191;
                buf[pos++] = 189;
                lead = c;
                continue;
              } else {
                c = lead - 55296 << 10 | c - 56320 | 65536;
                lead = null;
              }
            } else {
              if (c > 56319 || i + 1 === str.length) {
                buf[pos++] = 239;
                buf[pos++] = 191;
                buf[pos++] = 189;
              } else {
                lead = c;
              }
              continue;
            }
          } else if (lead) {
            buf[pos++] = 239;
            buf[pos++] = 191;
            buf[pos++] = 189;
            lead = null;
          }
          if (c < 128) {
            buf[pos++] = c;
          } else {
            if (c < 2048) {
              buf[pos++] = c >> 6 | 192;
            } else {
              if (c < 65536) {
                buf[pos++] = c >> 12 | 224;
              } else {
                buf[pos++] = c >> 18 | 240;
                buf[pos++] = c >> 12 & 63 | 128;
              }
              buf[pos++] = c >> 6 & 63 | 128;
            }
            buf[pos++] = c & 63 | 128;
          }
        }
        return pos;
      }
    }
  });

  // node_modules/@mapbox/point-geometry/index.js
  var require_point_geometry = __commonJS({
    "node_modules/@mapbox/point-geometry/index.js"(exports, module) {
      "use strict";
      module.exports = Point;
      function Point(x, y) {
        this.x = x;
        this.y = y;
      }
      Point.prototype = {
        /**
         * Clone this point, returning a new point that can be modified
         * without affecting the old one.
         * @return {Point} the clone
         */
        clone: function() {
          return new Point(this.x, this.y);
        },
        /**
         * Add this point's x & y coordinates to another point,
         * yielding a new point.
         * @param {Point} p the other point
         * @return {Point} output point
         */
        add: function(p) {
          return this.clone()._add(p);
        },
        /**
         * Subtract this point's x & y coordinates to from point,
         * yielding a new point.
         * @param {Point} p the other point
         * @return {Point} output point
         */
        sub: function(p) {
          return this.clone()._sub(p);
        },
        /**
         * Multiply this point's x & y coordinates by point,
         * yielding a new point.
         * @param {Point} p the other point
         * @return {Point} output point
         */
        multByPoint: function(p) {
          return this.clone()._multByPoint(p);
        },
        /**
         * Divide this point's x & y coordinates by point,
         * yielding a new point.
         * @param {Point} p the other point
         * @return {Point} output point
         */
        divByPoint: function(p) {
          return this.clone()._divByPoint(p);
        },
        /**
         * Multiply this point's x & y coordinates by a factor,
         * yielding a new point.
         * @param {Point} k factor
         * @return {Point} output point
         */
        mult: function(k) {
          return this.clone()._mult(k);
        },
        /**
         * Divide this point's x & y coordinates by a factor,
         * yielding a new point.
         * @param {Point} k factor
         * @return {Point} output point
         */
        div: function(k) {
          return this.clone()._div(k);
        },
        /**
         * Rotate this point around the 0, 0 origin by an angle a,
         * given in radians
         * @param {Number} a angle to rotate around, in radians
         * @return {Point} output point
         */
        rotate: function(a) {
          return this.clone()._rotate(a);
        },
        /**
         * Rotate this point around p point by an angle a,
         * given in radians
         * @param {Number} a angle to rotate around, in radians
         * @param {Point} p Point to rotate around
         * @return {Point} output point
         */
        rotateAround: function(a, p) {
          return this.clone()._rotateAround(a, p);
        },
        /**
         * Multiply this point by a 4x1 transformation matrix
         * @param {Array<Number>} m transformation matrix
         * @return {Point} output point
         */
        matMult: function(m) {
          return this.clone()._matMult(m);
        },
        /**
         * Calculate this point but as a unit vector from 0, 0, meaning
         * that the distance from the resulting point to the 0, 0
         * coordinate will be equal to 1 and the angle from the resulting
         * point to the 0, 0 coordinate will be the same as before.
         * @return {Point} unit vector point
         */
        unit: function() {
          return this.clone()._unit();
        },
        /**
         * Compute a perpendicular point, where the new y coordinate
         * is the old x coordinate and the new x coordinate is the old y
         * coordinate multiplied by -1
         * @return {Point} perpendicular point
         */
        perp: function() {
          return this.clone()._perp();
        },
        /**
         * Return a version of this point with the x & y coordinates
         * rounded to integers.
         * @return {Point} rounded point
         */
        round: function() {
          return this.clone()._round();
        },
        /**
         * Return the magitude of this point: this is the Euclidean
         * distance from the 0, 0 coordinate to this point's x and y
         * coordinates.
         * @return {Number} magnitude
         */
        mag: function() {
          return Math.sqrt(this.x * this.x + this.y * this.y);
        },
        /**
         * Judge whether this point is equal to another point, returning
         * true or false.
         * @param {Point} other the other point
         * @return {boolean} whether the points are equal
         */
        equals: function(other) {
          return this.x === other.x && this.y === other.y;
        },
        /**
         * Calculate the distance from this point to another point
         * @param {Point} p the other point
         * @return {Number} distance
         */
        dist: function(p) {
          return Math.sqrt(this.distSqr(p));
        },
        /**
         * Calculate the distance from this point to another point,
         * without the square root step. Useful if you're comparing
         * relative distances.
         * @param {Point} p the other point
         * @return {Number} distance
         */
        distSqr: function(p) {
          var dx = p.x - this.x, dy = p.y - this.y;
          return dx * dx + dy * dy;
        },
        /**
         * Get the angle from the 0, 0 coordinate to this point, in radians
         * coordinates.
         * @return {Number} angle
         */
        angle: function() {
          return Math.atan2(this.y, this.x);
        },
        /**
         * Get the angle from this point to another point, in radians
         * @param {Point} b the other point
         * @return {Number} angle
         */
        angleTo: function(b) {
          return Math.atan2(this.y - b.y, this.x - b.x);
        },
        /**
         * Get the angle between this point and another point, in radians
         * @param {Point} b the other point
         * @return {Number} angle
         */
        angleWith: function(b) {
          return this.angleWithSep(b.x, b.y);
        },
        /*
         * Find the angle of the two vectors, solving the formula for
         * the cross product a x b = |a||b|sin(θ) for θ.
         * @param {Number} x the x-coordinate
         * @param {Number} y the y-coordinate
         * @return {Number} the angle in radians
         */
        angleWithSep: function(x, y) {
          return Math.atan2(
            this.x * y - this.y * x,
            this.x * x + this.y * y
          );
        },
        _matMult: function(m) {
          var x = m[0] * this.x + m[1] * this.y, y = m[2] * this.x + m[3] * this.y;
          this.x = x;
          this.y = y;
          return this;
        },
        _add: function(p) {
          this.x += p.x;
          this.y += p.y;
          return this;
        },
        _sub: function(p) {
          this.x -= p.x;
          this.y -= p.y;
          return this;
        },
        _mult: function(k) {
          this.x *= k;
          this.y *= k;
          return this;
        },
        _div: function(k) {
          this.x /= k;
          this.y /= k;
          return this;
        },
        _multByPoint: function(p) {
          this.x *= p.x;
          this.y *= p.y;
          return this;
        },
        _divByPoint: function(p) {
          this.x /= p.x;
          this.y /= p.y;
          return this;
        },
        _unit: function() {
          this._div(this.mag());
          return this;
        },
        _perp: function() {
          var y = this.y;
          this.y = this.x;
          this.x = -y;
          return this;
        },
        _rotate: function(angle) {
          var cos = Math.cos(angle), sin = Math.sin(angle), x = cos * this.x - sin * this.y, y = sin * this.x + cos * this.y;
          this.x = x;
          this.y = y;
          return this;
        },
        _rotateAround: function(angle, p) {
          var cos = Math.cos(angle), sin = Math.sin(angle), x = p.x + cos * (this.x - p.x) - sin * (this.y - p.y), y = p.y + sin * (this.x - p.x) + cos * (this.y - p.y);
          this.x = x;
          this.y = y;
          return this;
        },
        _round: function() {
          this.x = Math.round(this.x);
          this.y = Math.round(this.y);
          return this;
        }
      };
      Point.convert = function(a) {
        if (a instanceof Point) {
          return a;
        }
        if (Array.isArray(a)) {
          return new Point(a[0], a[1]);
        }
        return a;
      };
    }
  });

  // node_modules/@mapbox/vector-tile/lib/vectortilefeature.js
  var require_vectortilefeature = __commonJS({
    "node_modules/@mapbox/vector-tile/lib/vectortilefeature.js"(exports, module) {
      "use strict";
      var Point = require_point_geometry();
      module.exports = VectorTileFeature;
      function VectorTileFeature(pbf, end, extent, keys, values) {
        this.properties = {};
        this.extent = extent;
        this.type = 0;
        this._pbf = pbf;
        this._geometry = -1;
        this._keys = keys;
        this._values = values;
        pbf.readFields(readFeature, this, end);
      }
      function readFeature(tag, feature, pbf) {
        if (tag == 1) feature.id = pbf.readVarint();
        else if (tag == 2) readTag(pbf, feature);
        else if (tag == 3) feature.type = pbf.readVarint();
        else if (tag == 4) feature._geometry = pbf.pos;
      }
      function readTag(pbf, feature) {
        var end = pbf.readVarint() + pbf.pos;
        while (pbf.pos < end) {
          var key = feature._keys[pbf.readVarint()], value = feature._values[pbf.readVarint()];
          feature.properties[key] = value;
        }
      }
      VectorTileFeature.types = ["Unknown", "Point", "LineString", "Polygon"];
      VectorTileFeature.prototype.loadGeometry = function() {
        var pbf = this._pbf;
        pbf.pos = this._geometry;
        var end = pbf.readVarint() + pbf.pos, cmd = 1, length = 0, x = 0, y = 0, lines = [], line;
        while (pbf.pos < end) {
          if (length <= 0) {
            var cmdLen = pbf.readVarint();
            cmd = cmdLen & 7;
            length = cmdLen >> 3;
          }
          length--;
          if (cmd === 1 || cmd === 2) {
            x += pbf.readSVarint();
            y += pbf.readSVarint();
            if (cmd === 1) {
              if (line) lines.push(line);
              line = [];
            }
            line.push(new Point(x, y));
          } else if (cmd === 7) {
            if (line) {
              line.push(line[0].clone());
            }
          } else {
            throw new Error("unknown command " + cmd);
          }
        }
        if (line) lines.push(line);
        return lines;
      };
      VectorTileFeature.prototype.bbox = function() {
        var pbf = this._pbf;
        pbf.pos = this._geometry;
        var end = pbf.readVarint() + pbf.pos, cmd = 1, length = 0, x = 0, y = 0, x1 = Infinity, x2 = -Infinity, y1 = Infinity, y2 = -Infinity;
        while (pbf.pos < end) {
          if (length <= 0) {
            var cmdLen = pbf.readVarint();
            cmd = cmdLen & 7;
            length = cmdLen >> 3;
          }
          length--;
          if (cmd === 1 || cmd === 2) {
            x += pbf.readSVarint();
            y += pbf.readSVarint();
            if (x < x1) x1 = x;
            if (x > x2) x2 = x;
            if (y < y1) y1 = y;
            if (y > y2) y2 = y;
          } else if (cmd !== 7) {
            throw new Error("unknown command " + cmd);
          }
        }
        return [x1, y1, x2, y2];
      };
      VectorTileFeature.prototype.toGeoJSON = function(x, y, z) {
        var size = this.extent * Math.pow(2, z), x0 = this.extent * x, y0 = this.extent * y, coords = this.loadGeometry(), type = VectorTileFeature.types[this.type], i, j;
        function project(line) {
          for (var j2 = 0; j2 < line.length; j2++) {
            var p = line[j2], y2 = 180 - (p.y + y0) * 360 / size;
            line[j2] = [
              (p.x + x0) * 360 / size - 180,
              360 / Math.PI * Math.atan(Math.exp(y2 * Math.PI / 180)) - 90
            ];
          }
        }
        switch (this.type) {
          case 1:
            var points = [];
            for (i = 0; i < coords.length; i++) {
              points[i] = coords[i][0];
            }
            coords = points;
            project(coords);
            break;
          case 2:
            for (i = 0; i < coords.length; i++) {
              project(coords[i]);
            }
            break;
          case 3:
            coords = classifyRings(coords);
            for (i = 0; i < coords.length; i++) {
              for (j = 0; j < coords[i].length; j++) {
                project(coords[i][j]);
              }
            }
            break;
        }
        if (coords.length === 1) {
          coords = coords[0];
        } else {
          type = "Multi" + type;
        }
        var result = {
          type: "Feature",
          geometry: {
            type,
            coordinates: coords
          },
          properties: this.properties
        };
        if ("id" in this) {
          result.id = this.id;
        }
        return result;
      };
      function classifyRings(rings) {
        var len = rings.length;
        if (len <= 1) return [rings];
        var polygons = [], polygon, ccw;
        for (var i = 0; i < len; i++) {
          var area = signedArea(rings[i]);
          if (area === 0) continue;
          if (ccw === void 0) ccw = area < 0;
          if (ccw === area < 0) {
            if (polygon) polygons.push(polygon);
            polygon = [rings[i]];
          } else {
            polygon.push(rings[i]);
          }
        }
        if (polygon) polygons.push(polygon);
        return polygons;
      }
      function signedArea(ring) {
        var sum = 0;
        for (var i = 0, len = ring.length, j = len - 1, p1, p2; i < len; j = i++) {
          p1 = ring[i];
          p2 = ring[j];
          sum += (p2.x - p1.x) * (p1.y + p2.y);
        }
        return sum;
      }
    }
  });

  // node_modules/@mapbox/vector-tile/lib/vectortilelayer.js
  var require_vectortilelayer = __commonJS({
    "node_modules/@mapbox/vector-tile/lib/vectortilelayer.js"(exports, module) {
      "use strict";
      var VectorTileFeature = require_vectortilefeature();
      module.exports = VectorTileLayer;
      function VectorTileLayer(pbf, end) {
        this.version = 1;
        this.name = null;
        this.extent = 4096;
        this.length = 0;
        this._pbf = pbf;
        this._keys = [];
        this._values = [];
        this._features = [];
        pbf.readFields(readLayer, this, end);
        this.length = this._features.length;
      }
      function readLayer(tag, layer, pbf) {
        if (tag === 15) layer.version = pbf.readVarint();
        else if (tag === 1) layer.name = pbf.readString();
        else if (tag === 5) layer.extent = pbf.readVarint();
        else if (tag === 2) layer._features.push(pbf.pos);
        else if (tag === 3) layer._keys.push(pbf.readString());
        else if (tag === 4) layer._values.push(readValueMessage(pbf));
      }
      function readValueMessage(pbf) {
        var value = null, end = pbf.readVarint() + pbf.pos;
        while (pbf.pos < end) {
          var tag = pbf.readVarint() >> 3;
          value = tag === 1 ? pbf.readString() : tag === 2 ? pbf.readFloat() : tag === 3 ? pbf.readDouble() : tag === 4 ? pbf.readVarint64() : tag === 5 ? pbf.readVarint() : tag === 6 ? pbf.readSVarint() : tag === 7 ? pbf.readBoolean() : null;
        }
        return value;
      }
      VectorTileLayer.prototype.feature = function(i) {
        if (i < 0 || i >= this._features.length) throw new Error("feature index out of bounds");
        this._pbf.pos = this._features[i];
        var end = this._pbf.readVarint() + this._pbf.pos;
        return new VectorTileFeature(this._pbf, end, this.extent, this._keys, this._values);
      };
    }
  });

  // node_modules/@mapbox/vector-tile/lib/vectortile.js
  var require_vectortile = __commonJS({
    "node_modules/@mapbox/vector-tile/lib/vectortile.js"(exports, module) {
      "use strict";
      var VectorTileLayer = require_vectortilelayer();
      module.exports = VectorTile2;
      function VectorTile2(pbf, end) {
        this.layers = pbf.readFields(readTile, {}, end);
      }
      function readTile(tag, layers, pbf) {
        if (tag === 3) {
          var layer = new VectorTileLayer(pbf, pbf.readVarint() + pbf.pos);
          if (layer.length) layers[layer.name] = layer;
        }
      }
    }
  });

  // node_modules/@mapbox/vector-tile/index.js
  var require_vector_tile = __commonJS({
    "node_modules/@mapbox/vector-tile/index.js"(exports, module) {
      module.exports.VectorTile = require_vectortile();
      module.exports.VectorTileFeature = require_vectortilefeature();
      module.exports.VectorTileLayer = require_vectortilelayer();
    }
  });

  // src/Index.ts
  var Index_exports = {};
  __export(Index_exports, {
    default: () => Index_default,
    mapboxVectorTileLayer: () => mapboxVectorTileLayer
  });

  // src/MapboxVectorTileLayer.ts
  var import_pbf = __toESM(require_pbf(), 1);
  var import_vector_tile = __toESM(require_vector_tile(), 1);
  function decodeVectorTileBuffer(buffer, z, x, y) {
    const u8 = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    const pbf = new import_pbf.default(u8);
    const vt = new import_vector_tile.VectorTile(pbf);
    const features = [];
    for (const layerName in vt.layers) {
      const layer = vt.layers[layerName];
      for (let i = 0; i < layer.length; i++) {
        try {
          const feature = layer.feature(i);
          const geojson = feature.toGeoJSON(x, y, z);
          features.push({
            layer: layerName,
            id: feature.id,
            properties: feature.properties || {},
            attributes: feature.properties || {},
            raw: feature,
            geometry: geojson && geojson.geometry ? geojson.geometry : geojson
          });
        } catch (e) {
        }
      }
    }
    return features;
  }
  var WMTS = class extends L.GridLayer {
    constructor(urlTemplate, options) {
      var _a, _b, _c, _d, _e;
      if (!urlTemplate) throw new Error("WMTSVectorTile: urlTemplate is required");
      const merged = Object.assign({}, options, {
        tileSize: (_a = options.tileSize) != null ? _a : 256,
        tilePixelRatio: (_b = options.tilePixelRatio) != null ? _b : typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
        // Use simple shorthand 'MVT' as default format; request will map to correct MIME
        format: (_c = options.format) != null ? _c : "MVT",
        // default pane for tile layers
        pane: (_d = options.pane) != null ? _d : "overlayPane",
        // default minZoom
        minZoom: (_e = options.minZoom) != null ? _e : 0
      });
      super(merged);
      // currently hovered feature key (layer:id) used to de-duplicate hover events across tiles
      this._hoveredFeatureKey = null;
      this._hoveredFeature = null;
      // per-feature style overrides keyed by `${layer}:${id}`
      this._featureStyles = /* @__PURE__ */ new Map();
      // public selection state accessible to consumers
      this.selectedFeatureId = null;
      this.selectedFeatureLayer = null;
      // internal selected feature object for event payloads
      this._selectedFeature = null;
      this.options = merged;
      this.urlTemplate = urlTemplate;
      this.layerName = options.layerName;
    }
    onRemove(map) {
      return super.onRemove(map);
    }
    createTile(coords, done) {
      const tileSize = this.getTileSize();
      const canvas = document.createElement("canvas");
      canvas.className = "leaflet-tile leaflet-interactive";
      canvas.style.pointerEvents = "auto";
      const ratio = this.options.tilePixelRatio || (window.devicePixelRatio || 1);
      canvas.width = Math.max(1, Math.round(tileSize.x * ratio));
      canvas.height = Math.max(1, Math.round(tileSize.y * ratio));
      canvas.style.width = `${tileSize.x}px`;
      canvas.style.height = `${tileSize.y}px`;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        done(new Error("Canvas not supported"));
        return canvas;
      }
      ctx.scale(ratio, ratio);
      ctx.clearRect(0, 0, tileSize.x, tileSize.y);
      const z = coords.z;
      const x = coords.x;
      const y = coords.y;
      const tileRow = this.options.tms ? (1 << z) - 1 - y : y;
      let url = this.urlTemplate.replace("{LayerName}", this.layerName || "").replace("{z}", String(z)).replace("{x}", String(x)).replace("{y}", String(tileRow));
      canvas.__mvt_tile = { coords, z };
      canvas.addEventListener("click", (ev) => this._onTileClick(ev));
      canvas.addEventListener("dblclick", (ev) => this._onTileDoubleClick(ev));
      if (this.options.enableFeatureContextMenu) {
        canvas.addEventListener("contextmenu", (ev) => this._onTileContextMenu(ev));
      }
      canvas.addEventListener("mousemove", (ev) => this._onTileMouseMove(ev));
      canvas.addEventListener("mouseout", (ev) => this._onTileMouseOut(ev));
      const acceptHeader = this.options.format === "MVT" ? "application/vnd.mapbox-vector-tile" : this.options.format || "application/vnd.mapbox-vector-tile";
      fetch(url, { headers: { Accept: acceptHeader } }).then((res) => {
        if (!res.ok) {
          console.warn("Tile fetch error", res.status);
          try {
            this.fire && this.fire("tilefetcherror", {
              error: res.status,
              url,
              coords,
              z,
              x,
              y: tileRow,
              originalEvent: res
            });
          } catch (e) {
          }
        }
        return res.arrayBuffer();
      }).then((arrayBuffer) => {
        try {
          const features = decodeVectorTileBuffer(arrayBuffer, z, x, y);
          this._renderFeaturesToCanvas(features, ctx, coords, tileSize.x, z);
          ctx.canvas.__mvtFeatures = ctx.canvas.__mvtFeatures || [];
          ctx.canvas.__mvtFeatures = features;
          done(void 0, canvas);
        } catch (err) {
          console.warn("Vector tile decode/render error", err);
          done(err);
        }
      }).catch((err) => {
        console.warn("Tile fetch error", err);
        try {
          this.fire && this.fire("tilefetcherror", {
            error: err,
            url,
            coords,
            z,
            x,
            y: tileRow,
            originalEvent: err
          });
        } catch (e) {
        }
        done(err);
      });
      return canvas;
    }
    _renderFeaturesToCanvas(features, ctx, coords, tilePx, z) {
      const tileSize = tilePx;
      const map = this._map;
      if (!features || features.length === 0) {
        if (window.__MVT_DEBUG__) {
          console.debug(`MapboxVectorTile.WMTS: no features decoded for tile z="${z}", x="${coords.x}", y="${coords.y}"`);
        }
      }
      const debug = window.__MVT_DEBUG__;
      if (debug) {
        ctx.save();
        ctx.strokeStyle = "magenta";
        ctx.lineWidth = 1 / (this.options.tilePixelRatio || (window.devicePixelRatio || 1));
        ctx.strokeRect(0, 0, tilePx, tilePx);
        ctx.restore();
      }
      const placedLabels = [];
      const drawnFeatures = /* @__PURE__ */ new Set();
      for (const f of features) {
        if (window.__MVT_DEBUG__) {
          try {
            console.debug("WMTSVectorTile feature", {
              layer: f.layer,
              type: f.geometry && f.geometry.type,
              properties: f.properties,
              attributes: f.attributes,
              sample: f.geometry && f.geometry.coordinates && (f.geometry.coordinates.length ? f.geometry.coordinates[0] : f.geometry.coordinates)
            });
          } catch (e) {
          }
        }
        const layerName = f.layer;
        const style = this._getStyleForLayer(layerName, f);
        ctx.save();
        ctx.fillStyle = style.fill;
        ctx.strokeStyle = style.stroke;
        ctx.lineWidth = style.lineWidth;
        const geom = f.geometry;
        if (!geom) {
          ctx.restore();
          continue;
        }
        switch (geom.type) {
          case "Point": {
            const [lng, lat] = geom.coordinates;
            const p = this._projectPoint(lng, lat, z, coords);
            this._drawPoint(ctx, p.x, p.y, style);
            break;
          }
          case "MultiPoint": {
            for (const pt of geom.coordinates) {
              const [lng, lat] = pt;
              const p = this._projectPoint(lng, lat, z, coords);
              this._drawPoint(ctx, p.x, p.y, style);
            }
            break;
          }
          case "LineString": {
            this._drawLineString(ctx, geom.coordinates, z, coords, style);
            break;
          }
          case "MultiLineString": {
            for (const line of geom.coordinates) {
              this._drawLineString(ctx, line, z, coords, style);
            }
            break;
          }
          case "Polygon": {
            this._drawPolygon(ctx, geom.coordinates, z, coords, style);
            break;
          }
          case "MultiPolygon": {
            const multi = geom.coordinates;
            for (const poly of multi) {
              this._drawPolygon(ctx, poly, z, coords, style);
            }
            break;
          }
          default:
            break;
        }
        ctx.restore();
      }
    }
    _getStyleForLayer(layerName, feature) {
      const s = this.options.style || {};
      const layerStyles = s.layers || {};
      const st = layerName && layerStyles[layerName] ? layerStyles[layerName] : void 0;
      const base = {
        fill: st && st.fill ? st.fill : s.defaultFill || "rgba(0,0,0,0.1)",
        stroke: st && st.stroke ? st.stroke : s.defaultStroke || "rgba(0,0,0,0.6)",
        lineWidth: st && st.lineWidth !== void 0 ? st.lineWidth : s.defaultLineWidth || 1
      };
      if (feature) {
        const key = this._getFeatureKey(feature);
        if (key) {
          const fs = this._featureStyles.get(key);
          if (fs) {
            return {
              fill: fs.fill !== void 0 ? fs.fill : base.fill,
              stroke: fs.stroke !== void 0 ? fs.stroke : base.stroke,
              lineWidth: fs.lineWidth !== void 0 ? fs.lineWidth : base.lineWidth
            };
          }
        }
      }
      return base;
    }
    // Project a coordinate (may be lon/lat or tile-local) into tile-local pixel coordinates
    _projectPoint(lng, lat, z, tileCoords) {
      const isLikelyTileCoords = Math.abs(lng) > 360 || Math.abs(lat) > 90 || lng > 4096 || lat > 4096;
      let latDeg = lat;
      let lonDeg = lng;
      if (isLikelyTileCoords) {
        const extent = 4096;
        const px = lng;
        const py = lat;
        const globalX = tileCoords.x + px / extent;
        const globalY = tileCoords.y + py / extent;
        const n = Math.pow(2, z);
        lonDeg = globalX / n * 360 - 180;
        const latRad = Math.atan(Math.sinh(Math.PI * (1 - 2 * globalY / n)));
        latDeg = latRad * 180 / Math.PI;
      }
      const globalPoint = this._map.project([latDeg, lonDeg], z);
      const tileOrigin = L.point(tileCoords.x * this.getTileSize().x, tileCoords.y * this.getTileSize().y);
      return { x: globalPoint.x - tileOrigin.x, y: globalPoint.y - tileOrigin.y };
    }
    _drawPoint(ctx, x, y, style) {
      const r = 4;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      if (style.fill) ctx.fill();
      if (style.stroke) ctx.stroke();
    }
    _drawLineString(ctx, coords, z, tileCoords, style) {
      if (!coords || coords.length === 0) return;
      ctx.beginPath();
      for (let i = 0; i < coords.length; i++) {
        const [lng, lat] = coords[i];
        const p = this._projectPoint(lng, lat, z, tileCoords);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      if (style.stroke) ctx.stroke();
    }
    _drawPolygon(ctx, rings, z, tileCoords, style) {
      if (!rings || rings.length === 0) return;
      ctx.beginPath();
      for (let r = 0; r < rings.length; r++) {
        const ring = rings[r];
        for (let i = 0; i < ring.length; i++) {
          const coord = ring[i];
          const lng = coord[0];
          const lat = coord[1];
          const p = this._projectPoint(lng, lat, z, tileCoords);
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
      }
      if (style.fill) ctx.fill();
      if (style.stroke) ctx.stroke();
    }
    // Compute an anchor point (in tile-local pixels)
    _getAnchorPosition(geom, z, tileCoords) {
      try {
        switch (geom.type) {
          case "Point": {
            const [lng, lat] = geom.coordinates;
            return this._projectPoint(lng, lat, z, tileCoords);
          }
          case "MultiPoint": {
            const [lng, lat] = geom.coordinates[0];
            return this._projectPoint(lng, lat, z, tileCoords);
          }
          case "LineString": {
            const coords = geom.coordinates;
            const mid = Math.floor(coords.length / 2);
            const [lng, lat] = coords[mid];
            return this._projectPoint(lng, lat, z, tileCoords);
          }
          case "Polygon": {
            const rings = geom.coordinates;
            if (!rings || rings.length === 0) return null;
            const ring = rings[0];
            let sx = 0, sy = 0, count = 0;
            for (const c of ring) {
              sx += c[0];
              sy += c[1];
              count++;
            }
            if (count === 0) return null;
            const cx = sx / count;
            const cy = sy / count;
            return this._projectPoint(cx, cy, z, tileCoords);
          }
          default:
            return null;
        }
      } catch (e) {
        return null;
      }
    }
    // derive unique key for a feature if id present
    _getFeatureKey(f) {
      if (f.id !== void 0 && f.id !== null) return `${f.layer}:${String(f.id)}`;
      return null;
    }
    // Public API: set style for a feature by DecodedFeature or by layer+id
    setFeatureStyle(feature, style) {
      const key = this._getFeatureKey(feature);
      if (!key) return false;
      this._featureStyles.set(key, style);
      try {
        this.redraw();
      } catch (e) {
      }
      return true;
    }
    setFeatureStyleById(layerName, id, style) {
      const key = `${layerName}:${String(id)}`;
      this._featureStyles.set(key, style);
      try {
        this.redraw();
      } catch (e) {
      }
    }
    clearFeatureStyle(feature) {
      const key = this._getFeatureKey(feature);
      if (!key) return false;
      const removed = this._featureStyles.delete(key);
      try {
        this.redraw();
      } catch (e) {
      }
      return removed;
    }
    clearFeatureStyleById(layerName, id) {
      const key = `${layerName}:${String(id)}`;
      const removed = this._featureStyles.delete(key);
      try {
        this.redraw();
      } catch (e) {
      }
      return removed;
    }
    clearAllFeatureStyles() {
      this._featureStyles.clear();
      try {
        this.redraw();
      } catch (e) {
      }
    }
    // Mouse handlers for tile canvas
    _hitTestGeom(geom, px, py, z, tileCoords) {
      var _a;
      const tol = (_a = this.options.hitTolerance) != null ? _a : 6;
      switch (geom.type) {
        case "Point": {
          const p = this._projectPoint(geom.coordinates[0], geom.coordinates[1], z, tileCoords);
          const dx = p.x - px;
          const dy = p.y - py;
          return Math.hypot(dx, dy) <= tol;
        }
        case "MultiPoint": {
          for (const pt of geom.coordinates) {
            const p = this._projectPoint(pt[0], pt[1], z, tileCoords);
            if (Math.hypot(p.x - px, p.y - py) <= tol) return true;
          }
          return false;
        }
        case "LineString": {
          const lineTol = Math.max(1, Math.round(tol * 0.66));
          for (let i = 0; i < geom.coordinates.length - 1; i++) {
            const a = this._projectPoint(geom.coordinates[i][0], geom.coordinates[i][1], z, tileCoords);
            const b = this._projectPoint(geom.coordinates[i + 1][0], geom.coordinates[i + 1][1], z, tileCoords);
            if (this._pointToSegmentDistance(px, py, a.x, a.y, b.x, b.y) <= lineTol) return true;
          }
          return false;
        }
        case "Polygon": {
          const ring = geom.coordinates[0];
          const pts = ring.map((c) => this._projectPoint(c[0], c[1], z, tileCoords));
          return this._pointInPolygon({ x: px, y: py }, pts);
        }
        case "MultiPolygon": {
          const multi = geom.coordinates;
          for (const poly of multi) {
            if (!poly || poly.length === 0) continue;
            const ring = poly[0];
            const pts = ring.map((c) => this._projectPoint(c[0], c[1], z, tileCoords));
            if (this._pointInPolygon({ x: px, y: py }, pts)) return true;
          }
          return false;
        }
        default:
          return false;
      }
    }
    _pointToSegmentDistance(px, py, x1, y1, x2, y2) {
      const A = px - x1;
      const B = py - y1;
      const C = x2 - x1;
      const D = y2 - y1;
      const dot = A * C + B * D;
      const lenSq = C * C + D * D;
      let param = -1;
      if (lenSq !== 0) param = dot / lenSq;
      let xx, yy;
      if (param < 0) {
        xx = x1;
        yy = y1;
      } else if (param > 1) {
        xx = x2;
        yy = y2;
      } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
      }
      const dx = px - xx;
      const dy = py - yy;
      return Math.hypot(dx, dy);
    }
    _pointInPolygon(pt, vs) {
      let inside = false;
      for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        const xi = vs[i].x, yi = vs[i].y;
        const xj = vs[j].x, yj = vs[j].y;
        const intersect = yi > pt.y !== yj > pt.y && pt.x < (xj - xi) * (pt.y - yi) / (yj - yi) + xi;
        if (intersect) inside = !inside;
      }
      return inside;
    }
    _onTileClick(ev) {
      const canvas = ev.currentTarget;
      if (!canvas) return;
      const features = canvas.__mvtFeatures;
      if (!features || features.length === 0) return;
      const tile = canvas.__mvt_tile;
      if (!tile) return;
      const rect = canvas.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;
      const ratio = this.options.tilePixelRatio || (window.devicePixelRatio || 1);
      const px = x * ratio;
      const py = y * ratio;
      for (const f of features) {
        const geom = f.geometry;
        if (!geom) continue;
        if (this._hitTestGeom(geom, px, py, tile.z, tile.coords)) {
          let latlng = void 0;
          const pos = this._getAnchorPosition(geom, tile.z, tile.coords);
          const map = this._map;
          if (pos && map) {
            const globalX = tile.coords.x * this.getTileSize().x + pos.x;
            const globalY = tile.coords.y * this.getTileSize().y + pos.y;
            const worldPoint = L.point(globalX, globalY);
            latlng = map.unproject ? map.unproject(worldPoint, tile.z) : map.layerPointToLatLng(worldPoint);
          }
          const prevSelectedKey = this._selectedFeature ? this._getFeatureKey(this._selectedFeature) : null;
          const thisKey = this._getFeatureKey(f);
          if (prevSelectedKey && thisKey && prevSelectedKey === thisKey) {
            const prev = this._selectedFeature;
            this._selectedFeature = null;
            this.selectedFeatureId = null;
            this.selectedFeatureLayer = null;
            try {
              this.fire && this.fire("featureunselected", { layerName: prev && prev.layer, feature: prev, originalEvent: ev });
            } catch (e) {
            }
            return;
          }
          if (this._selectedFeature) {
            const prev = this._selectedFeature;
            this._selectedFeature = null;
            this.selectedFeatureId = null;
            this.selectedFeatureLayer = null;
            try {
              this.fire && this.fire("featureunselected", { layerName: prev.layer, feature: prev, originalEvent: ev });
            } catch (e) {
            }
          }
          this._selectedFeature = f;
          this.selectedFeatureId = f.id !== void 0 ? f.id : null;
          this.selectedFeatureLayer = f.layer;
          const payload = {
            layerName: f.layer,
            feature: f,
            latlng,
            // include original mouse event
            originalEvent: ev
          };
          try {
            this.fire && this.fire("featureclick", payload);
            this.fire && this.fire("featureselected", payload);
          } catch (e) {
          }
          return;
        }
      }
      if (this._selectedFeature) {
        const prev = this._selectedFeature;
        this._selectedFeature = null;
        this.selectedFeatureId = null;
        this.selectedFeatureLayer = null;
        try {
          this.fire && this.fire("featureunselected", { layerName: prev.layer, feature: prev, originalEvent: ev });
        } catch (e) {
        }
      }
    }
    _onTileDoubleClick(ev) {
      const canvas = ev.currentTarget;
      if (!canvas) return;
      const features = canvas.__mvtFeatures;
      if (!features || features.length === 0) return;
      const tile = canvas.__mvt_tile;
      if (!tile) return;
      const rect = canvas.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;
      const ratio = this.options.tilePixelRatio || (window.devicePixelRatio || 1);
      const px = x * ratio;
      const py = y * ratio;
      for (const f of features) {
        const geom = f.geometry;
        if (!geom) continue;
        if (this._hitTestGeom(geom, px, py, tile.z, tile.coords)) {
          let latlng = void 0;
          const pos = this._getAnchorPosition(geom, tile.z, tile.coords);
          const map = this._map;
          if (pos && map) {
            const globalX = tile.coords.x * this.getTileSize().x + pos.x;
            const globalY = tile.coords.y * this.getTileSize().y + pos.y;
            const worldPoint = L.point(globalX, globalY);
            latlng = map.unproject ? map.unproject(worldPoint, tile.z) : map.layerPointToLatLng(worldPoint);
          }
          const payload = {
            layerName: f.layer,
            feature: f,
            latlng,
            // include original mouse event
            originalEvent: ev
          };
          try {
            this.fire && this.fire("featuredblclick", payload);
          } catch (e) {
          }
          return;
        }
      }
    }
    _onTileContextMenu(ev) {
      try {
        ev.preventDefault();
      } catch (e) {
      }
      const canvas = ev.currentTarget;
      if (!canvas) return;
      const features = canvas.__mvtFeatures;
      if (!features || features.length === 0) return;
      const tile = canvas.__mvt_tile;
      if (!tile) return;
      const rect = canvas.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;
      const ratio = this.options.tilePixelRatio || (window.devicePixelRatio || 1);
      const px = x * ratio;
      const py = y * ratio;
      for (const f of features) {
        const geom = f.geometry;
        if (!geom) continue;
        if (this._hitTestGeom(geom, px, py, tile.z, tile.coords)) {
          let latlng = void 0;
          const pos = this._getAnchorPosition(geom, tile.z, tile.coords);
          const map = this._map;
          if (pos && map) {
            const globalX = tile.coords.x * this.getTileSize().x + pos.x;
            const globalY = tile.coords.y * this.getTileSize().y + pos.y;
            const worldPoint = L.point(globalX, globalY);
            latlng = map.unproject ? map.unproject(worldPoint, tile.z) : map.layerPointToLatLng(worldPoint);
          }
          const payload = {
            layerName: f.layer,
            feature: f,
            latlng,
            // include original mouse event
            originalEvent: ev
          };
          try {
            this.fire && this.fire("featurecontextmenu", payload);
          } catch (e) {
          }
          return;
        }
      }
    }
    _onTileMouseMove(ev) {
      const canvas = ev.currentTarget;
      if (!canvas) return;
      const features = canvas.__mvtFeatures;
      if (!features || features.length === 0) return;
      const tile = canvas.__mvt_tile;
      if (!tile) return;
      const rect = canvas.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;
      const ratio = this.options.tilePixelRatio || (window.devicePixelRatio || 1);
      const px = x * ratio;
      const py = y * ratio;
      let hit = null;
      for (const f of features) {
        const geom = f.geometry;
        if (!geom) continue;
        if (this._hitTestGeom(geom, px, py, tile.z, tile.coords)) {
          hit = f;
          break;
        }
      }
      const hitKey = hit ? this._getFeatureKey(hit) : null;
      const prevKey = this._hoveredFeatureKey;
      if (hit && hitKey && hitKey !== prevKey) {
        if (this._hoveredFeature && prevKey) {
          const outPayload = { layerName: this._hoveredFeature.layer, feature: this._hoveredFeature, originalEvent: ev };
          try {
            this.fire && this.fire("featuremouseout", outPayload);
          } catch (e) {
          }
        }
        this._hoveredFeatureKey = hitKey;
        this._hoveredFeature = hit;
        const inPayload = { layerName: hit.layer, feature: hit, originalEvent: ev };
        try {
          this.fire && this.fire("featuremouseover", inPayload);
        } catch (e) {
        }
      } else if (!hit && prevKey) {
        const related = ev.relatedTarget;
        const movedToCanvas = related && related.tagName === "CANVAS" && related.__mvt_tile;
        if (!movedToCanvas) {
          const outFeature = this._hoveredFeature;
          this._hoveredFeatureKey = null;
          this._hoveredFeature = null;
          if (outFeature) {
            const outPayload = { layerName: outFeature.layer, feature: outFeature, originalEvent: ev };
            try {
              this.fire && this.fire("featuremouseout", outPayload);
            } catch (e) {
            }
          }
        }
      }
    }
    _onTileMouseOut(_ev) {
      return;
    }
  };
  function mapboxVectorTileLayer(urlTemplate, options) {
    return new WMTS(urlTemplate, options);
  }
  try {
    if (typeof window !== "undefined" && window.L) {
      const Lg = window.L;
      if (!Lg.mapboxVectorTileLayer) Lg.mapboxVectorTileLayer = mapboxVectorTileLayer;
    }
  } catch (e) {
  }

  // src/Index.ts
  var g = globalThis;
  if (g && !g.wmtsVectorTile) {
    g.wmtsVectorTile = mapboxVectorTileLayer;
  }
  try {
    if (globalThis.L && !globalThis.L.mapboxVectorTileLayer) {
      globalThis.L.mapboxVectorTileLayer = mapboxVectorTileLayer;
    }
  } catch (e) {
  }
  var Index_default = MapboxVectorLayer;
  return __toCommonJS(Index_exports);
})();
/*! Bundled license information:

ieee754/index.js:
  (*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> *)
*/
//# sourceMappingURL=leaflet-vectortile-mapbox-src.js.map
