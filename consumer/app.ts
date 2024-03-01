import amqp from "amqplib/callback_api";

async function connect() {
  try {
    await amqp.connect(
      "amqp://34.202.68.165/",
      (err: any, conn: amqp.Connection) => {
        if (err) throw new Error(err);
        conn.createChannel((errChanel: any, channel: amqp.Channel) => {
          if (errChanel) throw new Error(errChanel);
          channel.assertQueue();
          channel.consume("app.initial", async (data: amqp.Message | null) => {
            console.log(`cola : app.initial con datos: `);
            if (data?.content !== undefined) {
              const content = data?.content;
              const parsedContent = JSON.parse(content.toString());
              const headers = {
                "Content-Type": "application/json",
              };
              const body = {
                method: "POST",
                headers,
                body: JSON.stringify(parsedContent),
              };
              fetch("http://localhost:8000/payment", body)
                .then(() => {
                  console.log("datos enviados");
                })
                .catch((err: any) => {
                  throw new Error(err);
                });
              // enciar darps
              await channel.ack(data);
            }
          });
        });
      }
    );
  } catch (err: any) {
    throw new Error(err);
  }
}

connect();
