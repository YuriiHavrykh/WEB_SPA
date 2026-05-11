import React, { useState, useEffect } from 'react';
import { repairDetailsApi, servicesApi, partsApi } from '../services/api';

const EMPTY_LINE = {
    type: 'service',
    idService: '',
    idPart: '',
    count: 1,
    additionalCost: '',
};

function DetailRow({
    d, services, parts, onRemove,
}) {
    const svc = services.find((x) => Number(x.idService) === Number(d.idService));
    const prt = parts.find((x) => Number(x.idPart) === Number(d.idPart));
    let name;
    if (d.idService) {
        name = svc ? svc.serviceName : `Послуга #${d.idService}`;
    } else {
        name = prt ? prt.partName : `Запчастина #${d.idPart}`;
    }
    const typeLabel = d.idService ? 'Послуга' : 'Запчастина';
    const badgeClass = d.idService ? 'badge--admin' : 'badge--manager';
    const cost = d.additionalCost
        ? `${parseFloat(d.additionalCost).toFixed(2)} грн`
        : '—';

    return (
        <tr>
            <td>
                <span className={`badge ${badgeClass}`}>{typeLabel}</span>
            </td>
            <td>{name}</td>
            <td>{d.count}</td>
            <td>{cost}</td>
            <td>
                <button
                    type="button"
                    className="btn btn--sm btn--danger"
                    onClick={() => onRemove(d.idRepairDetail)}
                >
                    Видалити
                </button>
            </td>
        </tr>
    );
}

function RepairDetailModal({ repair, credentials, onClose }) {
    const [details, setDetails] = useState([]);
    const [services, setServices] = useState([]);
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [line, setLine] = useState(EMPTY_LINE);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const repairId = Number(repair.idRepair);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            repairDetailsApi.getAll(credentials, 1),
            servicesApi.getAll(credentials, 1),
            partsApi.getAll(credentials, 1),
        ]).then(([allDetails, svcs, pts]) => {
            const rawDetails = Array.isArray(allDetails)
                ? allDetails : (allDetails.results || []);
            const rawServices = Array.isArray(svcs) ? svcs : (svcs.results || []);
            const rawParts = Array.isArray(pts) ? pts : (pts.results || []);
            const mine = rawDetails.filter(
                (d) => Number(d.idRepair) === repairId,
            );
            setDetails(mine);
            setServices(rawServices);
            setParts(rawParts);
        }).catch((err) => {
            setError(`Помилка завантаження: ${err.message}`);
        }).finally(() => {
            setLoading(false);
        });
    }, [credentials, repairId]);

    const handleLineChange = (e) => {
        const { name, value } = e.target;
        if (name === 'type') {
            setLine((prev) => ({
                ...prev, type: value, idService: '', idPart: '',
            }));
            return;
        }
        setLine((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddLine = async (e) => {
        e.preventDefault();
        setError('');

        const isService = line.type === 'service';
        const selectedId = isService ? line.idService : line.idPart;
        if (!selectedId) {
            const msg = isService ? 'Оберіть послугу' : 'Оберіть запчастину';
            setError(msg);
            return;
        }

        const payload = {
            idRepair: repairId,
            count: Number(line.count),
        };
        if (isService) {
            payload.idService = Number(selectedId);
        } else {
            payload.idPart = Number(selectedId);
        }
        if (line.additionalCost) {
            payload.additionalCost = parseFloat(line.additionalCost);
        }

        setSaving(true);
        try {
            const created = await repairDetailsApi.create(credentials, payload);
            setDetails((prev) => [...prev, created]);
            setLine(EMPTY_LINE);
        } catch (err) {
            setError(err.message || 'Не вдалося додати позицію');
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveLine = async (id) => {
        if (!window.confirm('Видалити рядок?')) return;
        setError('');
        try {
            await repairDetailsApi.remove(credentials, id);
            setDetails((prev) => prev.filter((d) => d.idRepairDetail !== id));
        } catch (err) {
            setError(err.message || 'Не вдалося видалити позицію');
        }
    };

    const totalCost = details.reduce((acc, d) => {
        let lineCost = 0;
        if (d.idService) {
            const svc = services.find((x) => Number(x.idService) === Number(d.idService));
            lineCost += svc ? Number(svc.baseCost) * d.count : 0;
        }
        if (d.idPart) {
            const prt = parts.find((x) => Number(x.idPart) === Number(d.idPart));
            lineCost += prt ? Number(prt.cost) * d.count : 0;
        }
        if (d.additionalCost) lineCost += parseFloat(d.additionalCost);
        return acc + lineCost;
    }, 0);

    return (
        <div className="modal-overlay">
            <div className="modal modal--wide">
                <div className="modal__header">
                    <h2 className="modal__title">
                        {`Деталі ремонту #${repairId}`}
                    </h2>
                    <button type="button" className="modal__close" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className="modal__body">
                    {/* Помилка завжди зверху, добре видима */}
                    {error && (
                        <p className="form-error" style={{ marginBottom: '12px' }}>
                            {error}
                        </p>
                    )}

                    {loading ? (
                        <p className="page-status">Завантаження...</p>
                    ) : (
                        <>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Тип</th>
                                        <th>Назва</th>
                                        <th>Кількість</th>
                                        <th>Дод. вартість</th>
                                        <th aria-label="Дії" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {details.map((d) => (
                                        <DetailRow
                                            key={d.idRepairDetail}
                                            d={d}
                                            services={services}
                                            parts={parts}
                                            onRemove={handleRemoveLine}
                                        />
                                    ))}
                                    {details.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="table__empty">
                                                Немає позицій
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            <p className="detail-total">
                                {`Загальна: ${totalCost.toFixed(2)} грн`}
                            </p>

                            <hr className="detail-divider" />
                            <h3 className="detail-section-title">Додати позицію</h3>

                            <form onSubmit={handleAddLine}>
                                <div className="form-row">
                                    <div className="field">
                                        <label className="field__label" htmlFor="dl-type">
                                            Тип
                                        </label>
                                        <select
                                            id="dl-type"
                                            name="type"
                                            className="field__input"
                                            value={line.type}
                                            onChange={handleLineChange}
                                        >
                                            <option value="service">Послуга</option>
                                            <option value="part">Запчастина</option>
                                        </select>
                                    </div>
                                    <div className="field">
                                        <label className="field__label" htmlFor="dl-count">
                                            Кількість
                                        </label>
                                        <input
                                            id="dl-count"
                                            name="count"
                                            type="number"
                                            min="1"
                                            className="field__input"
                                            value={line.count}
                                            onChange={handleLineChange}
                                            required
                                        />
                                    </div>
                                </div>

                                {line.type === 'service' ? (
                                    <div className="field">
                                        <label className="field__label" htmlFor="dl-service">
                                            Послуга
                                        </label>
                                        <select
                                            id="dl-service"
                                            name="idService"
                                            className="field__input"
                                            value={line.idService}
                                            onChange={handleLineChange}
                                        >
                                            <option value="">
                                                — Оберіть послугу —
                                            </option>
                                            {services.map((s) => (
                                                <option key={s.idService} value={s.idService}>
                                                    {`${s.serviceName} (${s.baseCost} грн)`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <div className="field">
                                        <label className="field__label" htmlFor="dl-part">
                                            Запчастина
                                        </label>
                                        <select
                                            id="dl-part"
                                            name="idPart"
                                            className="field__input"
                                            value={line.idPart}
                                            onChange={handleLineChange}
                                        >
                                            <option value="">
                                                — Оберіть запчастину —
                                            </option>
                                            {parts.map((p) => (
                                                <option key={p.idPart} value={p.idPart}>
                                                    {`${p.partName} (${p.cost} грн)`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="field">
                                    <label className="field__label" htmlFor="dl-add-cost">
                                        Додаткова вартість (грн)
                                    </label>
                                    <input
                                        id="dl-add-cost"
                                        name="additionalCost"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className="field__input"
                                        value={line.additionalCost}
                                        onChange={handleLineChange}
                                    />
                                </div>

                                <div className="modal__actions">
                                    <button
                                        type="submit"
                                        className="btn btn--primary"
                                        disabled={saving}
                                    >
                                        {saving ? 'Збереження...' : '+ Додати'}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn--outline"
                                        onClick={onClose}
                                    >
                                        Закрити
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default RepairDetailModal;
