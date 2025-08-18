#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { FigmaWebAppStack } from './figma-web-app-stack';

const app = new cdk.App();

new FigmaWebAppStack(app, 'FigmaWebAppStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
});

app.synth();
