import { useState } from 'react'
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
} from '@mui/material'

const CreateSquadDialog = ({ open, onClose, onCreate }) => {
    const [formData, setFormData] = useState({
        name: '',
        formation: '4-3-3',
    })

    const handleInputChange = (event) => {
        const { name, value } = event.target

        setFormData((currentData) => ({
            ...currentData,
            [name]: value,
        }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        await onCreate(formData)

        setFormData({
            name: '',
            formation: '4-3-3',
        })
    }

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Create new squad</DialogTitle>

            <DialogContent>
                <Stack
                    component="form"
                    id="create-squad-form"
                    spacing={2}
                    className="home-dialog-content"
                    onSubmit={handleSubmit}
                >
                    <TextField
                        label="Squad name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="My Best XI"
                        required
                        fullWidth
                    />

                    <FormControl fullWidth required>
                        <InputLabel>Formation</InputLabel>
                        <Select
                            label="Formation"
                            name="formation"
                            value={formData.formation}
                            onChange={handleInputChange}
                        >
                            <MenuItem value="4-3-3">4-3-3</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>

                <Button type="submit" form="create-squad-form" variant="contained">
                    Create squad
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default CreateSquadDialog