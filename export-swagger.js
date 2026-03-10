const { NestFactory } = require('@nestjs/core');
const { SwaggerModule, DocumentBuilder } = require('@nestjs/swagger');
const { AppModule } = require('./dist/src/app.module');
const fs = require('fs');
const path = require('path');

async function exportSwagger() {
    const app = await NestFactory.create(AppModule, { logger: false });

    const config = new DocumentBuilder()
        .setTitle('Safe School API')
        .setDescription('The Safe School Backend API documentation')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);
    const json = JSON.stringify(document, null, 2);

    // 1. Write to dashboard project
    const dashboardPath = path.join(__dirname, '..', 'safe school_dashBoards', 'swagger-endpoints.json');
    fs.writeFileSync(dashboardPath, json, 'utf8');
    console.log(`✅ Exported to dashboard: ${dashboardPath}`);

    // 2. Write local copy in backend root
    const localPath = path.join(__dirname, 'swagger-endpoints.json');
    fs.writeFileSync(localPath, json, 'utf8');
    console.log(`✅ Exported local copy: ${localPath}`);

    process.exit(0);
}

exportSwagger().catch(err => {
    console.error(err);
    process.exit(1);
});
