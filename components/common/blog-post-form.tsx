"use client"

import { useState, useRef } from "react"
import { ImageIcon, Upload, Trash2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { GlassCardContent } from "@/components/ui/glass-card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getPexelsImage } from "@/lib/pexels/pexels"

interface BlogPostFormProps {
  title: string;
  setTitle: (title: string) => void;
  slug: string;
  setSlug: (slug: string) => void;
  coverImage: string;
  setCoverImage: (coverImage: string) => void;
  excerpt: string;
  setExcerpt: (excerpt: string) => void;
  category: string;
  setCategory: (category: string) => void;
  tags: string;
  setTags: (tags: string) => void;
  published: boolean;
  setPublished: (published: boolean) => void;
  categories: string[];
}

export default function BlogPostForm({
  title,
  setTitle,
  slug,
  setSlug,
  coverImage,
  setCoverImage,
  excerpt,
  setExcerpt,
  category,
  setCategory,
  tags,
  setTags,
  published,
  setPublished,
  categories,
}: BlogPostFormProps) {
    const [isLoadingImage, setIsLoadingImage] = useState<boolean>(false);
    const [dragActive, setDragActive] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(coverImage || null);

    // fetch a random image from Pexels based on category and tags
    const fetchRandomImage = async (): Promise<void> => {
        try {
            setIsLoadingImage(true);
            // Create a search query using the category and tags
            const tagArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
            const searchQuery = [category, ...tagArray.slice(0, 2)].filter(Boolean).join(' ');
            const imageData = await getPexelsImage(searchQuery, slug);
            
            setCoverImage(imageData.imageUrl);
            setImagePreview(imageData.imageUrl);
        } catch (error) {
            console.error('Failed to fetch Pexels image:', error);
        } finally {
            setIsLoadingImage(false);
        }
    };

    // Handle file upload
    const handleFileChange = (file: File) => {
        if (!file) return;
        
        // Check file type and size
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            alert('Image size should be less than 5MB');
            return;
        }
        
        // Create a URL for the file
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            setCoverImage(result);
            setImagePreview(result);
        };
        reader.readAsDataURL(file);
    };
    
    // Handle file input
    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileChange(e.target.files[0]);
        }
    };
    
    // Handle drag events
    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };
    
    // Handle drop event
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };
    
    // Handle clear image
    const handleClearImage = () => {
        setCoverImage('');
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <GlassCardContent>
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
                </div>

                <div className="space-y-2">
                    <Label>Cover Image</Label>
                    
                    {/* Image preview area */}
                    {imagePreview ? (
                        <div className="relative mb-4 rounded-lg overflow-hidden">
                            <img 
                                src={imagePreview} 
                                alt="Cover preview" 
                                className="w-full h-48 object-cover rounded-lg"
                            />
                            <Button 
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2 opacity-80 hover:opacity-100"
                                onClick={handleClearImage}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <div 
                            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                                dragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/20'
                            }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground mb-2">
                                Drag and drop an image here, or click to select a file
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Supported formats: JPG, PNG, WebP, GIF (max 5MB)
                            </p>
                        </div>
                    )}
                    
                    {/* Hidden file input */}
                    <Input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileInput}
                        accept="image/*"
                        className="hidden"
                    />
                    
                    {/* Image URL input and actions */}
                    <div className="flex gap-2 mt-4">
                        <Input
                            id="coverImage"
                            value={coverImage}
                            onChange={(e) => {
                                setCoverImage(e.target.value);
                                setImagePreview(e.target.value || null);
                            }}
                            placeholder="Image URL (optional)"
                            className="flex-1"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={fetchRandomImage}
                            disabled={isLoadingImage}
                        >
                            <ImageIcon className="h-4 w-4 mr-2" />
                            {isLoadingImage ? "Loading..." : "Generate"}
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Upload, drag & drop, enter URL, or generate based on category and tags</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                        id="excerpt"
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        required
                        className="min-h-[100px]"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                    {cat}
                                </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tags">Tags (comma separated)</Label>
                        <Input
                            id="tags"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="tag1, tag2, tag3"
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <Switch id="published" checked={published} onCheckedChange={setPublished} />
                    <Label htmlFor="published">Publish immediately</Label>
                </div>
            </div>
        </GlassCardContent>
    )
}
