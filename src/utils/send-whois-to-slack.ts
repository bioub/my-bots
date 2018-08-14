import { IncomingWebhook } from '@slack/client';

export async function sendWhoisToSlack(
  slackHookUrl: string,
  domain: string,
  whois,
) {
  const attachments = [
    {
      text: whois,
    },
  ];

  const webhook = new IncomingWebhook(slackHookUrl);
  const res = await webhook.send({
    text: `*${domain}*`,
    attachments,
  });
}
