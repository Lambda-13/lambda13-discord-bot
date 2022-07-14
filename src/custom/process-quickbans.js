#!/usr/bin/env node

// node .\src\custom\convert-quickbans-to-json.j

const fs = require('fs');
const cwd = require('process').cwd();
let cached_bans_raw = false;
let cached_bans = false;
let seached_banneds = false;


//    path = cwd + '\\..\\data\\quick_bans__schema.csv'
const path = cwd + '\\data\\quick_bans.csv';


/**
 * 
 * @param {*} cache_force
 * Checks cache, renewing if needed, and loads file to cache.
 */
function load_bans_from_file(cache_force = false) {
    process.stdout.write('Cache: ');
    if ((!cached_bans_raw)) console.log('empty, renewing...');
    if (cache_force) console.log('Ok, but forced, so renewing...');
    if ((!cached_bans_raw) || (cache_force)) {
        _data = fs.readFileSync(path, {encoding: 'utf-8', flag: 'r'}, (err, data) => {
            if (err) {
                console.error(err);
                return false;
            }
        });
        console.log('Data cached successfully.');
        return _data;
    }
    console.log('Ok, no need to renewing.');
    return _data;
}

function convert_raw_bans(bans_raw) {
    bans_raw_splited = bans_raw.replaceAll('\r', '').split('\n');
    let _data = {'ok': [], 'fail': []}, _was_fail = false;
    for (let ban_row of bans_raw_splited) {
        ban_row_splited = ban_row.split(';');
        /* if (ban_row_splited.length < 8) {  // if empty or broken
            _data.fail.push({
                'Raw': ban_row,
                'Splited': ban_row_splited,
            })
            if (!_was_fail) _was_fail = true;
            continue;
        } */
        //console.log('ban_row_splited:', ban_row_splited);
        for (let i = 0; i < ban_row_splited.length; i++) {
            if (ban_row_splited[i] == 'nil') ban_row_splited[i] = null;
            ban_row_splited[i] = Math.floor(ban_row_splited[i]) || ban_row_splited[i];
        }
        _data.ok.push({
            'Type': ban_row_splited[0], // Ban type
            'Factions': ban_row_splited[1], //banned factions (nil if other ban type)
            'Code': ban_row_splited[2], // Ban code
            'Reason': ban_row_splited[3],
            'Banner': ban_row_splited[4], // banner ckey
            'Date1': ban_row_splited[5], // Date (readable)
            'Date2': ban_row_splited[6], // Date (system)
            'Duration': ban_row_splited[7], // ban duration in Date (system)
            'Ckey': ban_row_splited[8], // banned ckey
            'Cid': ban_row_splited[9], // banned cid
            'IPv4': ban_row_splited[10], // banned ip
        })
    }
    if (_was_fail) console.log('Something was failed during parsing:\n', _data.fail);
    return _data;
}

/**
 * 
 * @param {*} input - Any of banner: ckey, cid, ip
 */
function get_banned(input) {
    /* const allowed_input = ['ckey', 'cid', 'ip'];
    if (!allowed_input.includes(input)) {
        console.error('get_banned: no allowed input: "' + input + '"');
        return false;
    } */
    let _data = [], _something_found = false;
    for (let i = 0; i < cached_bans.length; i++) {
        const ban_record = cached_bans[i];
        for (const [key, value] of Object.entries(ban_record)) {
            if (value == input) {
                _data.push(ban_record);
                if (!_something_found) _something_found = true;
            }
        }
    }
    return (_data.length == 0 ? false : _data)
}


console.clear();
console.log('path:', path);
cached_bans_raw = load_bans_from_file();     // Cache: empty, renewing...
cached_bans_raw = load_bans_from_file();     // Cache: Ok, no need to renewing.
cached_bans_raw = load_bans_from_file(true); // Cache: Ok, but forced, so renewing...

if (!cached_bans_raw) {console.log('Something was wrong!'); return;}
//console.log('cached_bans_raw:', cached_bans_raw);

cached_bans = convert_raw_bans(cached_bans_raw);
console.log('cached_bans.ok[0]:', cached_bans.ok[0]);
console.log('Total records:', cached_bans.ok.length + cached_bans.fail.length);
console.log('Successfilly parsed records:', cached_bans.ok.length);
console.log('Failed records:', cached_bans.fail.length);

seached_banneds = get_banned('shalopay1');
if (!seached_banneds) {console.log('None was found!'); return;}
console.log('seached_banneds:', seached_banneds);

return;
