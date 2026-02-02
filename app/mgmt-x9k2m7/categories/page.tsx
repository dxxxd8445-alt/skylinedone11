"use client";

import { useState, useEffect } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Folder,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Image,
  ToggleLeft,
  ToggleRight,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  
  // Form state
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    display_order: 0,
    is_active: true
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      } else {
        console.error("Failed to load categories");
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async () => {
    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryForm)
      });

      if (response.ok) {
        await loadCategories();
        setCreateModalOpen(false);
        resetForm();
        alert("Category created successfully!");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to create category");
      }
    } catch (error) {
      console.error("Failed to create category:", error);
      alert("Failed to create category");
    }
  };

  const updateCategory = async () => {
    if (!selectedCategory) return;
    
    try {
      const response = await fetch(`/api/admin/categories/${selectedCategory.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryForm)
      });

      if (response.ok) {
        await loadCategories();
        setEditModalOpen(false);
        resetForm();
        alert("Category updated successfully!");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to update category");
      }
    } catch (error) {
      console.error("Failed to update category:", error);
      alert("Failed to update category");
    }
  };

  const deleteCategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        await loadCategories();
        alert("Category deleted successfully!");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete category");
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
      alert("Failed to delete category");
    }
  };

  const toggleCategoryStatus = async (category: Category) => {
    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !category.is_active })
      });

      if (response.ok) {
        await loadCategories();
      } else {
        alert("Failed to update category status");
      }
    } catch (error) {
      console.error("Failed to update category:", error);
      alert("Failed to update category status");
    }
  };

  const moveCategory = async (category: Category, direction: 'up' | 'down') => {
    const newOrder = direction === 'up' ? category.display_order - 1 : category.display_order + 1;
    
    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_order: newOrder })
      });

      if (response.ok) {
        await loadCategories();
      } else {
        alert("Failed to reorder category");
      }
    } catch (error) {
      console.error("Failed to reorder category:", error);
      alert("Failed to reorder category");
    }
  };

  const viewCategory = (category: Category) => {
    setSelectedCategory(category);
    setViewModalOpen(true);
  };

  const editCategory = (category: Category) => {
    setSelectedCategory(category);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description,
      image_url: category.image_url,
      display_order: category.display_order,
      is_active: category.is_active
    });
    setEditModalOpen(true);
  };

  const openCreateModal = () => {
    resetForm();
    setCreateModalOpen(true);
  };

  const resetForm = () => {
    setCategoryForm({
      name: '',
      slug: '',
      description: '',
      image_url: '',
      display_order: categories.length,
      is_active: true
    });
    setSelectedCategory(null);
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Categories Management</h1>
            <p className="text-white/60 mt-1">Manage product categories and organization</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={loadCategories}
              disabled={loading}
              variant="outline"
              className="border-[#1a1a1a] text-white hover:bg-[#1a1a1a]"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={openCreateModal}
              className="bg-[#dc2626] hover:bg-[#ef4444] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-[#1a1a1a]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total Categories</p>
                  <p className="text-2xl font-bold text-white">{categories.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#dc2626]/10">
                  <Folder className="w-6 h-6 text-[#dc2626]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-[#1a1a1a]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Active Categories</p>
                  <p className="text-2xl font-bold text-white">
                    {categories.filter(c => c.is_active).length}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-green-500/10">
                  <ToggleRight className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-[#1a1a1a]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Inactive Categories</p>
                  <p className="text-2xl font-bold text-white">
                    {categories.filter(c => !c.is_active).length}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-red-500/10">
                  <ToggleLeft className="w-6 h-6 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-[#1a1a1a]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Game Categories</p>
                  <p className="text-2xl font-bold text-white">
                    {categories.filter(c => ['fortnite', 'apex-legends', 'call-of-duty', 'valorant', 'pubg', 'cs2', 'warzone', 'overwatch', 'rainbow-six-siege', 'rust'].includes(c.slug)).length}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10">
                  <Image className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-[#1a1a1a]">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <Input
                placeholder="Search categories by name, slug, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#0a0a0a] border-[#1a1a1a] text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Categories Table */}
        <Card className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-[#1a1a1a]">
          <CardHeader>
            <CardTitle className="text-white">Categories ({filteredCategories.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="py-12 flex justify-center">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-[#1a1a1a] rounded-full animate-spin" />
                  <div className="w-12 h-12 border-t-4 border-[#dc2626] rounded-full animate-spin absolute top-0 left-0" />
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#1a1a1a] hover:bg-transparent">
                      <TableHead className="text-white/60">Image</TableHead>
                      <TableHead className="text-white/60">Name</TableHead>
                      <TableHead className="text-white/60">Slug</TableHead>
                      <TableHead className="text-white/60">Description</TableHead>
                      <TableHead className="text-white/60">Order</TableHead>
                      <TableHead className="text-white/60">Status</TableHead>
                      <TableHead className="text-white/60">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCategories.map((category) => (
                      <TableRow key={category.id} className="border-[#1a1a1a] hover:bg-[#0a0a0a]/50">
                        <TableCell>
                          <div className="w-12 h-12 rounded-lg bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
                            {category.image_url ? (
                              <img 
                                src={category.image_url} 
                                alt={category.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Image className="w-6 h-6 text-white/40" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-semibold text-white">{category.name}</p>
                        </TableCell>
                        <TableCell>
                          <code className="font-mono text-sm bg-[#0a0a0a] px-2 py-1 rounded text-white/80">
                            {category.slug}
                          </code>
                        </TableCell>
                        <TableCell>
                          <p className="text-white/70 text-sm max-w-xs truncate">
                            {category.description || 'No description'}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-mono">{category.display_order}</span>
                            <div className="flex flex-col gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => moveCategory(category, 'up')}
                                className="h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-[#1a1a1a]"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => moveCategory(category, 'down')}
                                className="h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-[#1a1a1a]"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleCategoryStatus(category)}
                            className={`p-2 ${category.is_active 
                              ? 'text-green-400 hover:text-green-300 hover:bg-green-500/10' 
                              : 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                            }`}
                          >
                            {category.is_active ? (
                              <ToggleRight className="w-5 h-5" />
                            ) : (
                              <ToggleLeft className="w-5 h-5" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => viewCategory(category)}
                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => editCategory(category)}
                              className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteCategory(category.id, category.name)}
                              className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredCategories.length === 0 && !loading && (
                      <TableRow>
                        <TableCell colSpan={7} className="py-16 text-center">
                          <div className="w-16 h-16 rounded-full bg-[#dc2626]/10 flex items-center justify-center mx-auto mb-4">
                            <Folder className="w-8 h-8 text-[#dc2626]" />
                          </div>
                          <p className="text-white/60">No categories found</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Category Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-2 border-[#1a1a1a] max-w-2xl">
          {selectedCategory && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                  <Folder className="w-6 h-6 text-[#dc2626]" />
                  Category Details - {selectedCategory.name}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-white/60">Name</Label>
                    <p className="text-white font-semibold text-lg">{selectedCategory.name}</p>
                  </div>
                  <div>
                    <Label className="text-white/60">Slug</Label>
                    <code className="font-mono text-sm bg-[#1a1a1a] px-2 py-1 rounded text-[#dc2626]">
                      {selectedCategory.slug}
                    </code>
                  </div>
                  <div>
                    <Label className="text-white/60">Display Order</Label>
                    <p className="text-white font-semibold">{selectedCategory.display_order}</p>
                  </div>
                  <div>
                    <Label className="text-white/60">Status</Label>
                    <Badge className={selectedCategory.is_active 
                      ? "bg-green-500/20 text-green-400 border-0" 
                      : "bg-red-500/20 text-red-400 border-0"
                    }>
                      {selectedCategory.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                
                {selectedCategory.description && (
                  <div>
                    <Label className="text-white/60">Description</Label>
                    <p className="text-white/80 mt-1">{selectedCategory.description}</p>
                  </div>
                )}
                
                {selectedCategory.image_url && (
                  <div>
                    <Label className="text-white/60">Image</Label>
                    <div className="mt-2">
                      <img 
                        src={selectedCategory.image_url} 
                        alt={selectedCategory.name}
                        className="w-32 h-32 object-cover rounded-lg bg-[#1a1a1a]"
                      />
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <Label className="text-white/60">Created</Label>
                    <p className="text-white/70">{new Date(selectedCategory.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-white/60">Last Updated</Label>
                    <p className="text-white/70">{new Date(selectedCategory.updated_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Category Modal */}
      <Dialog open={createModalOpen || editModalOpen} onOpenChange={(open) => {
        if (!open) {
          setCreateModalOpen(false);
          setEditModalOpen(false);
          resetForm();
        }
      }}>
        <DialogContent className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border-2 border-[#1a1a1a] max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-3">
              {createModalOpen ? <Plus className="w-5 h-5 text-[#dc2626]" /> : <Edit className="w-5 h-5 text-[#dc2626]" />}
              {createModalOpen ? 'Create Category' : 'Edit Category'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white font-medium">Name *</Label>
                <Input
                  value={categoryForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setCategoryForm({ 
                      ...categoryForm, 
                      name,
                      slug: generateSlug(name)
                    });
                  }}
                  className="bg-[#0a0a0a] border-[#1a1a1a] text-white"
                  placeholder="Category name"
                />
              </div>
              <div>
                <Label className="text-white font-medium">Slug *</Label>
                <Input
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  className="bg-[#0a0a0a] border-[#1a1a1a] text-white font-mono"
                  placeholder="category-slug"
                />
              </div>
            </div>

            <div>
              <Label className="text-white font-medium">Description</Label>
              <Textarea
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                className="bg-[#0a0a0a] border-[#1a1a1a] text-white"
                placeholder="Category description"
                rows={3}
              />
            </div>

            <div>
              <Label className="text-white font-medium">Image URL</Label>
              <Input
                value={categoryForm.image_url}
                onChange={(e) => setCategoryForm({ ...categoryForm, image_url: e.target.value })}
                className="bg-[#0a0a0a] border-[#1a1a1a] text-white"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white font-medium">Display Order</Label>
                <Input
                  type="number"
                  value={categoryForm.display_order}
                  onChange={(e) => setCategoryForm({ ...categoryForm, display_order: parseInt(e.target.value) || 0 })}
                  className="bg-[#0a0a0a] border-[#1a1a1a] text-white"
                />
              </div>
              <div>
                <Label className="text-white font-medium">Status</Label>
                <select
                  value={categoryForm.is_active ? 'active' : 'inactive'}
                  onChange={(e) => setCategoryForm({ ...categoryForm, is_active: e.target.value === 'active' })}
                  className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#1a1a1a] text-white rounded-md"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={createModalOpen ? createCategory : updateCategory}
                className="flex-1 bg-[#dc2626] hover:bg-[#ef4444] text-white"
              >
                {createModalOpen ? 'Create Category' : 'Update Category'}
              </Button>
              <Button
                onClick={() => {
                  setCreateModalOpen(false);
                  setEditModalOpen(false);
                  resetForm();
                }}
                variant="outline"
                className="flex-1 border-[#1a1a1a] text-white hover:bg-[#1a1a1a]"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}