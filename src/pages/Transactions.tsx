import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, MapPin, Calendar, DollarSign } from "lucide-react";
import transactionData from "@/data/tirupatidataset_with_location.json";

interface Transaction {
  DISTRICT: string;
  MANDAL: string;
  VILLAGE: string;
  SRO_CODE: number;
  HABITATION: string;
  WARD_NO: number;
  BLOCK_NO: number;
  DOOR_NO: number;
  BI_NUMBER: string;
  TR_DOOR_NO: string;
  UNIT_RATE: number;
  REV_UNIT_RATE: number;
  PRE_REV_UNIT_RATE: number;
  EFFECTIVE_DATE: string;
  EX_EFFECTIVE_DATE: string;
  TIME_STAMP: string;
  REMARKS: string | null;
  USERNAME: string;
  COMM_RATE: number;
  REV_COMM_RATE: number;
  PRE_REV_COMM_RATE: number;
  SIN_DEL: string | null;
  REV_COMP_FLOOR1: number;
  REV_COMP_FLOOR_OTH: number;
  COMP_FLOOR1: number;
  COMP_FLOOR_OTH: number;
  PRE_COMP_FLOOR1: number;
  PRE_COMP_FLOOR_OTH: number;
  REV_TIMESTAMP: string | null;
  BI_WARD: string | null;
  BI_BLOCK: string | null;
  ROWID: string;
}

export const Transactions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const transactions: Transaction[] = transactionData.data;

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        transaction.TR_DOOR_NO.toLowerCase().includes(searchLower) ||
        transaction.VILLAGE.toLowerCase().includes(searchLower) ||
        transaction.MANDAL.toLowerCase().includes(searchLower) ||
        transaction.DISTRICT.toLowerCase().includes(searchLower)
      );
    });
  }, [transactions, searchTerm]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Land Registry Transactions
            </CardTitle>
            <p className="text-muted-foreground">
              Browse {transactions.length.toLocaleString()} property records from Tirupati
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by door number, village, mandal, or district..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>

            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Door No</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Unit Rate</TableHead>
                    <TableHead>Commercial Rate</TableHead>
                    <TableHead>Effective Date</TableHead>
                    <TableHead>Updated By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentTransactions.map((transaction) => (
                    <TableRow key={transaction.ROWID}>
                      <TableCell className="font-medium">
                        {transaction.TR_DOOR_NO}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-primary mt-0.5" />
                          <div>
                            <div className="font-medium">{transaction.VILLAGE}</div>
                            <div className="text-sm text-muted-foreground">
                              {transaction.MANDAL}, {transaction.DISTRICT}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-semibold">{formatCurrency(transaction.UNIT_RATE)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(transaction.COMM_RATE)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formatDate(transaction.EFFECTIVE_DATE)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {transaction.USERNAME}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredTransactions.length)} of{" "}
                {filteredTransactions.length} transactions
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium rounded-md border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium rounded-md border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
