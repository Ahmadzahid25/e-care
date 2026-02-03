import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { categorySchema, subcategorySchema, brandSchema, stateSchema } from '../utils/schemas.js';
import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getSubcategories,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
    getBrands,
    createBrand,
    updateBrand,
    deleteBrand,
    getStates,
    createState,
    updateState,
    deleteState,
} from '../controllers/master.controller.js';

const router = Router();

// Public read routes
router.get('/categories', getCategories);
router.get('/subcategories', getSubcategories);
router.get('/brands', getBrands);
router.get('/states', getStates);

// Admin write routes
router.post('/categories', authenticateToken, requireAdmin, validate(categorySchema), createCategory);
router.put('/categories/:id', authenticateToken, requireAdmin, validate(categorySchema), updateCategory);
router.delete('/categories/:id', authenticateToken, requireAdmin, deleteCategory);

router.post('/subcategories', authenticateToken, requireAdmin, validate(subcategorySchema), createSubcategory);
router.put('/subcategories/:id', authenticateToken, requireAdmin, validate(subcategorySchema), updateSubcategory);
router.delete('/subcategories/:id', authenticateToken, requireAdmin, deleteSubcategory);

router.post('/brands', authenticateToken, requireAdmin, validate(brandSchema), createBrand);
router.put('/brands/:id', authenticateToken, requireAdmin, validate(brandSchema), updateBrand);
router.delete('/brands/:id', authenticateToken, requireAdmin, deleteBrand);

router.post('/states', authenticateToken, requireAdmin, validate(stateSchema), createState);
router.put('/states/:id', authenticateToken, requireAdmin, validate(stateSchema), updateState);
router.delete('/states/:id', authenticateToken, requireAdmin, deleteState);

export default router;
