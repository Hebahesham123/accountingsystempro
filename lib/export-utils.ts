// Export and Print Utilities for Accounting System

export const exportToCSV = (data: any[], filename: string, headers: string[]) => {
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers.map((header) => {
        const value = row[header] || row[header.toLowerCase()] || ""
        // Escape quotes and wrap in quotes if contains comma or quote
        if (typeof value === "string" && (value.includes(",") || value.includes('"') || value.includes("\n"))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(",")
    ),
  ].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

export const exportToCSVCustom = (rows: string[][], filename: string) => {
  const csvContent = rows.map(row => 
    row.map(cell => {
      if (typeof cell === "string" && (cell.includes(",") || cell.includes('"') || cell.includes("\n"))) {
        return `"${cell.replace(/"/g, '""')}"`
      }
      return cell
    }).join(",")
  ).join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

export const printReport = (title: string, elementId?: string) => {
  const printWindow = window.open("", "_blank")
  if (!printWindow) {
    alert("Please allow popups to print this report")
    return
  }

  const element = elementId ? document.getElementById(elementId) : document.body
  if (!element) {
    alert("Report content not found")
    return
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          @media print {
            @page {
              margin: 1cm;
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 12px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
            .no-print {
              display: none;
            }
            h1, h2, h3 {
              margin-top: 20px;
              margin-bottom: 10px;
            }
          }
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        ${element.innerHTML}
      </body>
    </html>
  `)

  printWindow.document.close()
  printWindow.focus()
  
  // Wait for content to load, then print
  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 250)
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

