import {
  findPart
} from './googleSheet.js';

export function isStockQuestion(
  text
) {

  return true;
}

export async function findProductStock(
  text
) {

  return await findPart(text);
}

export function buildStockReply(
  result
) {

  // กัน null
  if (!result || !result.found) {

    return 'ไม่พบข้อมูล';
  }

  return [
    `Code : ${result.code}`,
    `Name : ${result.name}`,
    `Stock : ${result.stock}`
  ].join('\n');
}