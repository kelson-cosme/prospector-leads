
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Lead, LeadStatus, LeadStatusLabels } from '@/types/lead';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// Define formSchema and make all required fields non-optional to match the Lead type
const formSchema = z.object({
  businessName: z.string().min(2, { message: 'Nome da empresa é obrigatório' }),
  contactName: z.string().min(2, { message: 'Nome do contato é obrigatório' }),
  phone: z.string().min(1, { message: 'Telefone é obrigatório' }),
  email: z.string().email({ message: 'Email inválido' }).min(1, { message: 'Email é obrigatório' }),
  address: z.string().min(1, { message: 'Endereço é obrigatório' }),
  industry: z.string().min(1, { message: 'Indústria/Segmento é obrigatório' }),
  notes: z.string().default(''),
  status: z.enum(['new', 'contacted', 'interested', 'proposal', 'closed', 'lost']).default('new')
});

type FormValues = z.infer<typeof formSchema>;

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editingLead: Lead | null;
}

const LeadFormModal: React.FC<LeadFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingLead,
}) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: editingLead?.businessName || '',
      contactName: editingLead?.contactName || '',
      phone: editingLead?.phone || '',
      email: editingLead?.email || '',
      address: editingLead?.address || '',
      industry: editingLead?.industry || '',
      notes: editingLead?.notes || '',
      status: editingLead?.status || 'new',
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        businessName: editingLead?.businessName || '',
        contactName: editingLead?.contactName || '',
        phone: editingLead?.phone || '',
        email: editingLead?.email || '',
        address: editingLead?.address || '',
        industry: editingLead?.industry || '',
        notes: editingLead?.notes || '',
        status: editingLead?.status || 'new',
      });
    }
  }, [isOpen, editingLead, form]);

  const handleSubmit = (values: FormValues) => {
    // Now values will match the required type
    onSubmit(values);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingLead ? 'Editar Lead' : 'Adicionar Novo Lead'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Empresa *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="contactName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Contato *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Indústria/Segmento *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(Object.keys(LeadStatusLabels) as LeadStatus[]).map((status) => (
                        <SelectItem key={status} value={status}>
                          {LeadStatusLabels[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Anotações</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button type="submit">
                {editingLead ? 'Atualizar' : 'Adicionar'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default LeadFormModal;
