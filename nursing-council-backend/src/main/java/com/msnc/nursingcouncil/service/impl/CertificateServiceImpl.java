package com.msnc.nursingcouncil.service.impl;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.ColumnText;
import com.itextpdf.text.pdf.PdfContentByte;
import com.itextpdf.text.pdf.PdfWriter;
import com.msnc.nursingcouncil.entity.Application;
import com.msnc.nursingcouncil.service.CertificateService;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;

@Service
public class CertificateServiceImpl implements CertificateService {

    @Override
    public String generateCertificate(
            Application app,
            String registrationNumber
    ){

        try {

        	String regNo = registrationNumber;

        	if (regNo == null || regNo.isBlank()) {
        	    regNo = "MSNC-TEMP-" + System.currentTimeMillis();
        	}

            String folderPath = "certificates";

            File folder = new File(folderPath);

            if (!folder.exists()) {
                folder.mkdirs();
            }

            String fileName = regNo + ".pdf";

            String fullPath = folderPath + "/" + fileName;

            Document document = new Document(
                    PageSize.A4,
                    40,
                    40,
                    40,
                    40
            );

            PdfWriter writer = PdfWriter.getInstance(
                    document,
                    new FileOutputStream(fullPath)
            );

            document.open();

            PdfContentByte canvas = writer.getDirectContent();

         // =====================================
         // SIGNATURE IMAGE
         // =====================================

         try {

             Image sign = Image.getInstance(
                     "src/main/resources/static/signature.png"
             );

             sign.scaleToFit(120, 60);

             // MOVED UP
             sign.setAbsolutePosition(380, 120);

             document.add(sign);

         } catch (Exception e) {

             System.out.println("Signature image not found");
         }

         // =====================================
         // FONTS
         // =====================================

         Font titleFont = new Font(
                 Font.FontFamily.TIMES_ROMAN,
                 28,
                 Font.BOLD,
                 new BaseColor(0, 70, 70)
         );

         Font headingFont = new Font(
                 Font.FontFamily.TIMES_ROMAN,
                 22,
                 Font.BOLD,
                 BaseColor.BLACK
         );

         Font normalFont = new Font(
                 Font.FontFamily.TIMES_ROMAN,
                 16,
                 Font.NORMAL,
                 BaseColor.BLACK
         );

         Font boldFont = new Font(
                 Font.FontFamily.TIMES_ROMAN,
                 16,
                 Font.BOLD,
                 BaseColor.BLACK
         );

         Font nameFont = new Font(
                 Font.FontFamily.TIMES_ROMAN,
                 30,
                 Font.BOLDITALIC,
                 new BaseColor(0, 70, 70)
         );

         // =====================================
         // HEADER
         // =====================================

         ColumnText.showTextAligned(
                 canvas,
                 Element.ALIGN_CENTER,
                 new Phrase(
                         "MEGHALAYA STATE NURSING COUNCIL",
                         titleFont
                 ),
                 300,
                 780,
                 0
         );

         ColumnText.showTextAligned(
                 canvas,
                 Element.ALIGN_CENTER,
                 new Phrase(
                         "CERTIFICATE OF REGISTRATION",
                         headingFont
                 ),
                 300,
                 720,
                 0
         );

      // =====================================
      // CERTIFICATE BODY
      // =====================================

      ColumnText.showTextAligned(
              canvas,
              Element.ALIGN_CENTER,
              new Phrase(
                      "This is to certify that",
                      normalFont
              ),
              300,
              650,
              0
      );

      ColumnText.showTextAligned(
              canvas,
              Element.ALIGN_CENTER,
              new Phrase(
                      app.getApplicant().getFullName(),
                      nameFont
              ),
              300,
              585,
              0
      );

      String qualification = "GNM";

      if (
              app.getCourseDetail() != null &&
              app.getCourseDetail().getCourseName() != null
      ) {
          qualification = app.getCourseDetail()
                  .getCourseName()
                  .name()
                  .replace("_", " ");
      }

      String applicationType = app.getApplicationType()
              .name()
              .replace("_", " ");

      String bodyText =
              "has been duly registered as a Nurse under the Meghalaya State Nursing Council " +
              "and is entitled to practice as a Registered Nurse (RN) in India.";

      // PROPER WRAPPED PARAGRAPH
      ColumnText ct = new ColumnText(canvas);

      ct.setSimpleColumn(
              80,   // left
              470,  // bottom
              520,  // right
              540   // top
      );

      Paragraph para = new Paragraph(bodyText, normalFont);
      para.setAlignment(Element.ALIGN_CENTER);
      para.setLeading(24);

      ct.addElement(para);

      ct.go();

      // =====================================
      // DETAILS (SHIFTED LEFT)
      // =====================================

      ColumnText.showTextAligned(
              canvas,
              Element.ALIGN_LEFT,
              new Phrase(
                      "Registration Number : " + regNo,
                      boldFont
              ),
              70,
              390,
              0
      );

      ColumnText.showTextAligned(
              canvas,
              Element.ALIGN_LEFT,
              new Phrase(
                      "Date of Registration : " + java.time.LocalDate.now(),
                      boldFont
              ),
              70,
              355,
              0
      );

      ColumnText.showTextAligned(
              canvas,
              Element.ALIGN_LEFT,
              new Phrase(
                      "Qualification : " + qualification,
                      boldFont
              ),
              70,
              320,
              0
      );

      ColumnText.showTextAligned(
              canvas,
              Element.ALIGN_LEFT,
              new Phrase(
                      "Mode of Registration : " + applicationType,
                      boldFont
              ),
              70,
              285,
              0
      );

      ColumnText.showTextAligned(
              canvas,
              Element.ALIGN_LEFT,
              new Phrase(
                      "Date of Issue : " + java.time.LocalDate.now(),
                      boldFont
              ),
              70,
              240,
              0
      );

      // =====================================
      // SIGNATURE IMAGE
      // =====================================

      try {

          Image sign = Image.getInstance(
                  "src/main/resources/static/signature.png"
          );

          sign.scaleToFit(120, 60);

          // MOVED TO RIGHT SIDE
          sign.setAbsolutePosition(430, 110);

          document.add(sign);

      } catch (Exception e) {

          System.out.println("Signature image not found");
      }

      // =====================================
      // SIGNATURE LABEL
      // =====================================

      ColumnText.showTextAligned(
              canvas,
              Element.ALIGN_CENTER,
              new Phrase(
                      "(B. Lyngdoh)",
                      boldFont
              ),
              500,
              95,
              0
      );

      ColumnText.showTextAligned(
              canvas,
              Element.ALIGN_CENTER,
              new Phrase(
                      "Registrar",
                      normalFont
              ),
              500,
              70,
              0
      );

            document.close();

            return "http://localhost:8080/api/certificates/" + fileName;

        } catch (Exception e) {

            throw new RuntimeException(
                    "Failed to generate certificate",
                    e
            );
        }
    }
}