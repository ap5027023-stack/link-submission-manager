import { google } from "googleapis";
import type { User, LinkSubmission } from "@/types";

const SHEET_ID = process.env.GOOGLE_SHEETS_ID!;
const USERS_SHEET = "Users";
const LINKS_SHEET = "Links";

function getAuth() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

async function getSheetsClient() {
  const auth = getAuth();
  return google.sheets({ version: "v4", auth });
}

// ─── Sheet Initialization ───────────────────────────────────────────────────

export async function initializeSheets(): Promise<void> {
  const sheets = await getSheetsClient();

  // Check if sheets exist, create headers if not
  try {
    const res = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
    const existingSheets = res.data.sheets?.map((s) => s.properties?.title);

    const requests = [];

    if (!existingSheets?.includes(USERS_SHEET)) {
      requests.push({
        addSheet: { properties: { title: USERS_SHEET } },
      });
    }
    if (!existingSheets?.includes(LINKS_SHEET)) {
      requests.push({
        addSheet: { properties: { title: LINKS_SHEET } },
      });
    }

    if (requests.length > 0) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: { requests },
      });
    }

    // Set headers for Users sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${USERS_SHEET}!A1:H1`,
      valueInputOption: "RAW",
      requestBody: {
        values: [
          [
            "User ID",
            "Name",
            "Email",
            "Password Hash",
            "Submission Limit",
            "Status",
            "Created Date",
            "Role",
          ],
        ],
      },
    });

    // Set headers for Links sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${LINKS_SHEET}!A1:E1`,
      valueInputOption: "RAW",
      requestBody: {
        values: [
          ["Submission ID", "User ID", "User Email", "Link", "Timestamp"],
        ],
      },
    });
  } catch (error) {
    console.error("Error initializing sheets:", error);
    throw error;
  }
}

// ─── User Operations ─────────────────────────────────────────────────────────

export async function getAllUsers(): Promise<User[]> {
  const sheets = await getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${USERS_SHEET}!A2:H`,
  });

  const rows = res.data.values || [];
  return rows
    .filter((row) => row[0])
    .map((row) => ({
      id: row[0] || "",
      name: row[1] || "",
      email: row[2] || "",
      passwordHash: row[3] || "",
      submissionLimit: parseInt(row[4]) || 50,
      status: (row[5] as "active" | "disabled") || "active",
      createdDate: row[6] || "",
      role: (row[7] as "admin" | "user") || "user",
    }));
}

export async function getUserById(id: string): Promise<User | null> {
  const users = await getAllUsers();
  return users.find((u) => u.id === id) || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const users = await getAllUsers();
  return (
    users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null
  );
}

export async function createUser(user: User): Promise<void> {
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${USERS_SHEET}!A:H`,
    valueInputOption: "RAW",
    requestBody: {
      values: [
        [
          user.id,
          user.name,
          user.email,
          user.passwordHash,
          user.submissionLimit,
          user.status,
          user.createdDate,
          user.role,
        ],
      ],
    },
  });
}

export async function updateUser(
  id: string,
  updates: Partial<User>
): Promise<void> {
  const sheets = await getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${USERS_SHEET}!A:H`,
  });

  const rows = res.data.values || [];
  const rowIndex = rows.findIndex((row) => row[0] === id);
  if (rowIndex === -1) throw new Error("User not found");

  const existingRow = rows[rowIndex];
  const updatedRow = [
    existingRow[0],
    updates.name ?? existingRow[1],
    updates.email ?? existingRow[2],
    updates.passwordHash ?? existingRow[3],
    updates.submissionLimit ?? existingRow[4],
    updates.status ?? existingRow[5],
    existingRow[6],
    existingRow[7],
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${USERS_SHEET}!A${rowIndex + 1}:H${rowIndex + 1}`,
    valueInputOption: "RAW",
    requestBody: { values: [updatedRow] },
  });
}

export async function deleteUser(id: string): Promise<void> {
  const sheets = await getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${USERS_SHEET}!A:H`,
  });

  const rows = res.data.values || [];
  const rowIndex = rows.findIndex((row) => row[0] === id);
  if (rowIndex === -1) throw new Error("User not found");

  // Get sheet ID for batchUpdate
  const sheetRes = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID,
  });
  const userSheet = sheetRes.data.sheets?.find(
    (s) => s.properties?.title === USERS_SHEET
  );
  const sheetId = userSheet?.properties?.sheetId;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: rowIndex,
              endIndex: rowIndex + 1,
            },
          },
        },
      ],
    },
  });
}

// ─── Link Operations ──────────────────────────────────────────────────────────

export async function getAllLinks(): Promise<LinkSubmission[]> {
  const sheets = await getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${LINKS_SHEET}!A2:E`,
  });

  const rows = res.data.values || [];
  return rows
    .filter((row) => row[0])
    .map((row) => ({
      submissionId: row[0] || "",
      userId: row[1] || "",
      userEmail: row[2] || "",
      link: row[3] || "",
      timestamp: row[4] || "",
    }));
}

export async function getLinksByUser(userId: string): Promise<LinkSubmission[]> {
  const links = await getAllLinks();
  return links.filter((l) => l.userId === userId);
}

export async function getLinkCount(userId: string): Promise<number> {
  const links = await getLinksByUser(userId);
  return links.length;
}

export async function addLink(link: LinkSubmission): Promise<void> {
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${LINKS_SHEET}!A:E`,
    valueInputOption: "RAW",
    requestBody: {
      values: [
        [
          link.submissionId,
          link.userId,
          link.userEmail,
          link.link,
          link.timestamp,
        ],
      ],
    },
  });
}

export async function deleteLink(submissionId: string): Promise<void> {
  const sheets = await getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${LINKS_SHEET}!A:E`,
  });

  const rows = res.data.values || [];
  const rowIndex = rows.findIndex((row) => row[0] === submissionId);
  if (rowIndex === -1) throw new Error("Link not found");

  const sheetRes = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID,
  });
  const linkSheet = sheetRes.data.sheets?.find(
    (s) => s.properties?.title === LINKS_SHEET
  );
  const sheetId = linkSheet?.properties?.sheetId;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: rowIndex,
              endIndex: rowIndex + 1,
            },
          },
        },
      ],
    },
  });
}

export async function deleteLinksByUser(userId: string): Promise<void> {
  const links = await getLinksByUser(userId);
  for (const link of links) {
    await deleteLink(link.submissionId);
  }
}
