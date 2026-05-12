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

  if (!result.found) {

    return 'ไม่พบข้อมูล';
  }

  return [
    `Box no. : ${result.boxNo}`,
    `Total : ${result.total}`,
    `Supplier : ${result.supplier}`,
    `Customer : ${result.customer}`,
    `Use per Day : ${result.usePerDay}`
  ].join('\n');
}