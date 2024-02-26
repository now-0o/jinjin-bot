async function sendLoading(message, ment) {
  await sleep(100);
  await message.edit(`${ment} \\`);

  await sleep(100);
  await message.edit(`${ment} |`);

  await sleep(100);
  await message.edit(`${ment} /`);

  await sleep(100);
  await message.edit(`${ment} -`);

  await sleep(100);
  await message.edit(`${ment} \\`);

  await sleep(100);
  await message.edit(`${ment} |`);

  await sleep(100);
  await message.edit(`${ment} /`);
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  sendLoading,
  sleep,
};
