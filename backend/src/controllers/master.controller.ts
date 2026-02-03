import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase.js';

// Categories
export const getCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const { data, error } = await supabaseAdmin
            .from('categories')
            .select('*')
            .order('id', { ascending: true });

        if (error) {
            res.status(500).json({ error: 'Failed to fetch categories' });
            return;
        }

        res.json({ categories: data });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, description } = req.body;

        const { data, error } = await supabaseAdmin
            .from('categories')
            .insert({ name, description: description || null })
            .select()
            .single();

        if (error) {
            res.status(500).json({ error: 'Failed to create category' });
            return;
        }

        res.status(201).json({ message: 'Category created', category: data });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const { data, error } = await supabaseAdmin
            .from('categories')
            .update({ name, description, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            res.status(500).json({ error: 'Failed to update category' });
            return;
        }

        res.json({ message: 'Category updated', category: data });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const { error } = await supabaseAdmin
            .from('categories')
            .delete()
            .eq('id', id);

        if (error) {
            res.status(500).json({ error: 'Failed to delete category' });
            return;
        }

        res.json({ message: 'Category deleted' });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Subcategories
export const getSubcategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const { categoryId } = req.query;

        let query = supabaseAdmin
            .from('subcategories')
            .select(`
        *,
        categories:category_id (id, name)
      `)
            .order('name', { ascending: true });

        if (categoryId) {
            query = query.eq('category_id', categoryId);
        }

        const { data, error } = await query;

        if (error) {
            res.status(500).json({ error: 'Failed to fetch subcategories' });
            return;
        }

        res.json({ subcategories: data });
    } catch (error) {
        console.error('Get subcategories error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createSubcategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { category_id, name } = req.body;

        const { data, error } = await supabaseAdmin
            .from('subcategories')
            .insert({ category_id, name })
            .select()
            .single();

        if (error) {
            res.status(500).json({ error: 'Failed to create subcategory' });
            return;
        }

        res.status(201).json({ message: 'Subcategory created', subcategory: data });
    } catch (error) {
        console.error('Create subcategory error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateSubcategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { category_id, name } = req.body;

        const { data, error } = await supabaseAdmin
            .from('subcategories')
            .update({ category_id, name, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            res.status(500).json({ error: 'Failed to update subcategory' });
            return;
        }

        res.json({ message: 'Subcategory updated', subcategory: data });
    } catch (error) {
        console.error('Update subcategory error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteSubcategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const { error } = await supabaseAdmin
            .from('subcategories')
            .delete()
            .eq('id', id);

        if (error) {
            res.status(500).json({ error: 'Failed to delete subcategory' });
            return;
        }

        res.json({ message: 'Subcategory deleted' });
    } catch (error) {
        console.error('Delete subcategory error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Brands
export const getBrands = async (req: Request, res: Response): Promise<void> => {
    try {
        const { categoryId } = req.query;

        let query = supabaseAdmin
            .from('brands')
            .select(`
        *,
        categories:category_id (id, name)
      `)
            .order('name', { ascending: true });

        if (categoryId) {
            query = query.eq('category_id', categoryId);
        }

        const { data, error } = await query;

        if (error) {
            res.status(500).json({ error: 'Failed to fetch brands' });
            return;
        }

        res.json({ brands: data });
    } catch (error) {
        console.error('Get brands error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createBrand = async (req: Request, res: Response): Promise<void> => {
    try {
        const { category_id, name } = req.body;

        const { data, error } = await supabaseAdmin
            .from('brands')
            .insert({ category_id: category_id || null, name })
            .select()
            .single();

        if (error) {
            res.status(500).json({ error: 'Failed to create brand' });
            return;
        }

        res.status(201).json({ message: 'Brand created', brand: data });
    } catch (error) {
        console.error('Create brand error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateBrand = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { category_id, name } = req.body;

        const { data, error } = await supabaseAdmin
            .from('brands')
            .update({ category_id, name, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            res.status(500).json({ error: 'Failed to update brand' });
            return;
        }

        res.json({ message: 'Brand updated', brand: data });
    } catch (error) {
        console.error('Update brand error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteBrand = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const { error } = await supabaseAdmin
            .from('brands')
            .delete()
            .eq('id', id);

        if (error) {
            res.status(500).json({ error: 'Failed to delete brand' });
            return;
        }

        res.json({ message: 'Brand deleted' });
    } catch (error) {
        console.error('Delete brand error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// States
export const getStates = async (req: Request, res: Response): Promise<void> => {
    try {
        const { data, error } = await supabaseAdmin
            .from('states')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            res.status(500).json({ error: 'Failed to fetch states' });
            return;
        }

        res.json({ states: data });
    } catch (error) {
        console.error('Get states error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createState = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, description } = req.body;

        const { data, error } = await supabaseAdmin
            .from('states')
            .insert({ name, description: description || null })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                res.status(400).json({ error: 'State already exists' });
                return;
            }
            res.status(500).json({ error: 'Failed to create state' });
            return;
        }

        res.status(201).json({ message: 'State created', state: data });
    } catch (error) {
        console.error('Create state error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateState = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const { data, error } = await supabaseAdmin
            .from('states')
            .update({ name, description, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            res.status(500).json({ error: 'Failed to update state' });
            return;
        }

        res.json({ message: 'State updated', state: data });
    } catch (error) {
        console.error('Update state error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteState = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const { error } = await supabaseAdmin
            .from('states')
            .delete()
            .eq('id', id);

        if (error) {
            res.status(500).json({ error: 'Failed to delete state' });
            return;
        }

        res.json({ message: 'State deleted' });
    } catch (error) {
        console.error('Delete state error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
