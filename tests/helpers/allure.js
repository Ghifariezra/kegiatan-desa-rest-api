import * as allure from 'allure-js-commons';

const aktif = process.env.ALLURE_REPORT === '1';
const kosong = async () => { };

export const epic = aktif ? allure.epic : kosong;
export const feature = aktif ? allure.feature : kosong;
export const tag = aktif ? allure.tag : kosong;
export const attachment = aktif ? allure.attachment : kosong;