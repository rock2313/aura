import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ArrowRight, Calendar, DollarSign, FileText } from "lucide-react";
import { apiClient } from "@/services/apiClient";

interface Transaction {
  transactionId: string;
  propertyId: string;
  fromOwner: string;
  toOwner: string;
  amount: number;
  status: string;
  offerId: string;
  timestamp: string;
  type: string;
}

export const Transactions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const itemsPerPage = 20;

  // Load transactions from backend API
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const result = await apiClient.getAllTransactions();
        if (result.success && result.data) {
          // Sort by timestamp (most recent first)
          const sorted = [...result.data].sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          setTransactions(sorted);
        }
      } catch (error) {
        console.error('Failed to load transactions:', error);
      }
    };

    loadTransactions();

    // Refresh every 2 seconds to catch new transactions
    const interval = setInterval(loadTransactions, 2000);
    return () => clearInterval(interval);
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        transaction.transactionId.toLowerCase().includes(searchLower) ||
        transaction.propertyId.toLowerCase().includes(searchLower) ||
        transaction.type.toLowerCase().includes(searchLower) ||
        transaction.status.toLowerCase().includes(searchLower) ||
        transaction.fromOwner.toLowerCase().includes(searchLower) ||
        transaction.toOwner.toLowerCase().includes(searchLower)
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'VERIFIED':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'CANCELLED':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    return <FileText className="h-4 w-4" />;
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'PROPERTY_REGISTERED':
        return 'Property Registered';
      case 'OFFER_CREATED':
        return 'Offer Created';
      case 'OFFER_ACCEPTED':
        return 'Offer Accepted';
      case 'OFFER_REJECTED':
        return 'Offer Rejected';
      case 'OFFER_VERIFIED':
        return 'Admin Verified';
      case 'PROPERTY_TRANSFERRED':
        return 'Property Transferred';
      default:
        return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Blockchain Transactions
            </CardTitle>
            <p className="text-muted-foreground">
              {transactions.length === 0
                ? "No transactions yet. Start by registering a property or creating an offer."
                : `Viewing ${transactions.length} blockchain transaction${transactions.length !== 1 ? 's' : ''}`}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {transactions.length > 0 && (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by transaction ID, property ID, type, or user..."
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
                        <TableHead>Type</TableHead>
                        <TableHead>Property ID</TableHead>
                        <TableHead>From → To</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentTransactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No transactions found matching your search.
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentTransactions.map((transaction) => (
                          <TableRow key={transaction.transactionId}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getTypeIcon(transaction.type)}
                                <span className="font-medium text-sm">{getTypeLabel(transaction.type)}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {transaction.propertyId || '-'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground truncate max-w-[80px]">
                                  {transaction.fromOwner || 'System'}
                                </span>
                                <ArrowRight className="h-3 w-3 text-primary" />
                                <span className="font-medium truncate max-w-[80px]">
                                  {transaction.toOwner || 'System'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {transaction.amount > 0 ? (
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3 text-green-600" />
                                  <span className="font-semibold text-sm">{formatCurrency(transaction.amount)}</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                                {transaction.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{formatDate(transaction.timestamp)}</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {filteredTransactions.length > itemsPerPage && (
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
                )}
              </>
            )}

            {transactions.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Transactions Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Transactions will appear here as you interact with the platform.
                </p>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>Transactions are automatically created when you:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Register a new property</li>
                    <li>Create an offer on a property</li>
                    <li>Accept or reject an offer</li>
                    <li>Admin verifies a transaction</li>
                    <li>Complete a property transfer</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
