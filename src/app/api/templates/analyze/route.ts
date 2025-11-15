export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import PizZip from 'pizzip';
import { Permission } from '@prisma/client';
import { withApiAuth } from '@/lib/api-guard';

type EmptyContext = { params: Promise<Record<string, never>> };

const TEMPLATE_FILE = path.join(process.cwd(), 'templates', 'contract-template.docx');

export const GET = withApiAuth<EmptyContext>(
  { permissions: [Permission.MANAGE_TEMPLATES] },
  async () => {
    try {
    console.log('🔍 فحص القالب للبحث عن المتغيرات...');

    if (!fs.existsSync(TEMPLATE_FILE)) {
      return NextResponse.json({
        success: false,
        message: 'ملف القالب غير موجود'
      }, { status: 404 });
    }

    // قراءة القالب
    const templateBuffer = fs.readFileSync(TEMPLATE_FILE);
    const zip = new PizZip(templateBuffer);
    
    // استخراج محتوى document.xml
    let documentXml = '';
    try {
      documentXml = zip.file('word/document.xml')?.asText() || '';
    } catch (error) {
      console.error('خطأ في قراءة محتوى القالب:', error);
      return NextResponse.json({
        success: false,
        message: 'فشل في قراءة محتوى القالب'
      }, { status: 500 });
    }

    // البحث عن المتغيرات باستخدام regex لصيغة {{variable}}
    const variablePattern = /\{\{([^}]+)\}\}/g;
    const variables = new Set<string>();
    let match;

    while ((match = variablePattern.exec(documentXml)) !== null) {
      const variable = match[1].trim();
      if (variable) {
        variables.add(variable);
      }
    }

    // البحث عن متغيرات مباشرة في النص (النمط المستخدم في القالب الحالي)
    const directVariablePatterns = [
      /w:t>([A-Z][a-z]+[A-Z][a-zA-Z]*)<\/w:t/g, // نمط CamelCase
      /w:t>([a-z]+[a-z]*)<\/w:t/g, // نمط lowercase
    ];

    directVariablePatterns.forEach(pattern => {
      let directMatch;
      while ((directMatch = pattern.exec(documentXml)) !== null) {
        const variable = directMatch[1].trim();
        // التأكد من أن النص يبدو كمتغير وليس نص عادي
        if (variable.length > 3 && (
          /^[A-Z][a-z]+[A-Z]/.test(variable) || // ClientName, WorkerName
          ['client', 'worker', 'contract', 'delivery', 'payment', 'package', 'sales'].some(prefix => 
            variable.toLowerCase().startsWith(prefix)
          )
        )) {
          variables.add(variable);
        }
      }
    });

    const variablesList = Array.from(variables).sort();
    
    console.log('📋 المتغيرات الموجودة في القالب:', variablesList);

      return NextResponse.json({
      success: true,
      templateExists: true,
      variablesCount: variablesList.length,
      variables: variablesList,
      message: `تم العثور على ${variablesList.length} متغير في القالب`
    });

    } catch (error) {
      console.error('خطأ في فحص القالب:', error);
      return NextResponse.json({
        success: false,
        message: 'خطأ في فحص القالب: ' + (error instanceof Error ? error.message : 'خطأ غير معروف')
      }, { status: 500 });
    }
  }
);