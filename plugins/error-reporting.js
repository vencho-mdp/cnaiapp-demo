export default (ctx, inject) => {
  inject("reportNetworkError", async (error) => {
    if (process.env.NODE_ENV === "development") {
      console.error(error);
      return;
    }
    const data = {
      description: error,
      route: ctx.route.path,
    };
    await Promise.all([
      ctx.$axios.$post("/api/bugs", data),
      ctx.$mail.send({
        subject: "REPORTE AUTOMÁTICO DE BUG: CNAI APP",
        html: `
              <span> <p style="font-weight: bold;"> Description &nbsp; &nbsp; </p> ${data.description} </span>
              <br/>
              <span> <p style="font-weight: bold;"> Route &nbsp; &nbsp; </p> ${data.route} </span>
            `,
      }),
    ]);
  });
};
