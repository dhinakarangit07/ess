"use client"

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export default function HrTickets() {
  const [data, setData] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate API call
    const fetchTickets = () => {
      setLoading(true);

      // Mock data
      const mockTickets = Array.from({ length: 10 }, (_, i) => {
        const statuses = ["Open", "In Progress", "Close"];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 10));

        return {
          id: `TKT-${1000 + i}`,
          title: `Support Request ${i + 1}`,
          created_on: date.toISOString().split("T")[0],
          assigned_to: ["John Doe", "Jane Smith", "Robert Johnson"][Math.floor(Math.random() * 3)],
          status: status,
          last_updated: new Date().toISOString().split("T")[0],
          employee_name: ["Alex Chen", "Maria Garcia", "Sam Wilson"][Math.floor(Math.random() * 3)],
          department: ["IT", "Marketing", "Sales"][Math.floor(Math.random() * 3)],
          description: "This is a sample ticket description. The employee is requesting assistance with their account.",
        };
      });

      setData(mockTickets);
      setLoading(false);
    };

    fetchTickets();
  }, []);

  const handleTicketSelect = (ticket) => {
    setSelectedTicket(ticket);
    setIsReplyOpen(true);
  };

  const handleReplySubmit = () => {
    if (!selectedTicket || !replyText) {
      return;
    }

    // In a real app, you would send this to your API
    console.log({
      ticketId: selectedTicket.id,
      replyText,
    });

    // Update the ticket status in our local state
    const updatedData = data.map((ticket) => {
      if (ticket.id === selectedTicket.id) {
        return {
          ...ticket,
          status: "In Progress",
          last_updated: new Date().toISOString().split("T")[0],
        };
      }
      return ticket;
    });

    setData(updatedData);
    setReplyText("");
    setIsReplyOpen(false);
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case "Open":
        return <Badge className="bg-blue-100 text-blue-800 w-24 text-center justify-center">{status}</Badge>;
      case "In Progress":
        return <Badge className="bg-yellow-100 text-yellow-800 w-24 text-center justify-center">{status}</Badge>;
      case "Close":
        return <Badge className="bg-red-100 text-red-800 w-24 text-center justify-center">{status}</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 w-24 text-center justify-center">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div>
        <h2 className="text-xl font-semibold mb-4">Requested Tickets</h2>
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <h3 className="font-bold mb-4">
              TICKET INBOX <span className="text-blue-600">({data.length})</span>
            </h3>

            {loading && <p className="text-center py-4">Loading tickets...</p>}
            {error && <p className="text-center text-red-500 py-4">{error}</p>}

            {!loading && !error && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>TICKET NUMBER</TableHead>
                      <TableHead>TITLE</TableHead>
                      <TableHead>CREATED ON</TableHead>
                      <TableHead>ASSIGNED TO</TableHead>
                      <TableHead>STATUS</TableHead>
                      <TableHead>LAST UPDATED</TableHead>
                      <TableHead>ACTION</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((ticket) => (
                      <TableRow key={ticket.id} className="hover:bg-gray-50">
                        <TableCell>{ticket.id}</TableCell>
                        <TableCell className="font-medium">{ticket.title}</TableCell>
                        <TableCell>{ticket.created_on}</TableCell>
                        <TableCell>{ticket.assigned_to}</TableCell>
                        <TableCell>{renderStatusBadge(ticket.status)}</TableCell>
                        <TableCell>{ticket.last_updated}</TableCell>
                        <TableCell>
                          <Button size="sm" onClick={() => handleTicketSelect(ticket)}>
                            Reply
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reply Dialog */}
      <Dialog open={isReplyOpen} onOpenChange={setIsReplyOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reply to Ticket</DialogTitle>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p>
                    <strong className="text-gray-700">Ticket ID:</strong> {selectedTicket.id}
                  </p>
                  <p>
                    <strong className="text-gray-700">Employee Name:</strong> {selectedTicket.employee_name || "N/A"}
                  </p>
                  <p>
                    <strong className="text-gray-700">Title:</strong> {selectedTicket.title}
                  </p>
                </div>
                <div>
                  <p>
                    <strong className="text-gray-700">Created On:</strong> {selectedTicket.created_on}
                  </p>
                  <p>
                    <strong className="text-gray-700">Last Updated:</strong> {selectedTicket.last_updated}
                  </p>
                  <p>
                    <strong className="text-gray-700">Status:</strong> {renderStatusBadge(selectedTicket.status)}
                  </p>
                </div>
              </div>

              <div>
                <strong className="text-gray-700">Description:</strong>
                <p className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                  {selectedTicket.description || "No description provided."}
                </p>
              </div>

              <Textarea
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Please enter your reply..."
                className="w-full"
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReplyOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReplySubmit}>Send Reply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
