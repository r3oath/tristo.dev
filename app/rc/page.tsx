'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const units = ['ml', 'l'];

type Unit = typeof units[number];

type SavedRecord = {
	standardSubstanceVolume: string;
	standardSubstanceUnit: Unit;
	standardMediumVolume: string;
	standardMediumUnit: Unit;
	targetVolume: string;
	targetUnit: Unit;
	requiredSubstanceUnit: Unit;
	requiredSubstance: number;
	recordLabel: string;
};

const unitLabels: Record<Unit, string> = {
	ml: 'Milliliters',
	l: 'Liters',
};

const unitFactors: Record<Unit, number> = {
	ml: 1,
	l: 1000,
};

const convertToBase = (value: number, unit: Unit) => value * unitFactors[unit];

const convertFromBase = (value: number, unit: Unit) => value / unitFactors[unit];

const isNumber = (value: unknown): value is number => typeof value === 'number' && !isNaN(value);

const isUnit = (value: unknown): value is Unit => units.includes(value as Unit);

const formatNumber = (value: number) => Math.round((value + Number.EPSILON) * 1000) / 1000;

export default function RC() {
	const [standardSubstanceVolume, setStandardSubstanceVolume] = useState<string|undefined>();
	const [standardSubstanceUnit, setStandardSubstanceUnit] = useState<Unit|undefined>();
	const [standardMediumVolume, setStandardMediumVolume] = useState<string|undefined>();
	const [standardMediumUnit, setStandardMediumUnit] = useState<Unit|undefined>();
	const [targetVolume, setTargetVolume] = useState<string|undefined>();
	const [targetUnit, setTargetUnit] = useState<Unit|undefined>();
	const [requiredSubstanceUnit, setRequiredSubstanceUnit] = useState<Unit|undefined>();
	const [recordLabel, setRecordLabel] = useState<string|undefined>();
	const [records, setRecords] = useState<SavedRecord[]>([]);
	const [recordsOpen, setRecordsOpen] = useState(false);

	useEffect(() => {
		const records = JSON.parse(localStorage.getItem('records') || '[]');

		setRecords(records);
	}, []);

	const handleStandardSubstanceVolumeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		setStandardSubstanceVolume(event.target.value);
	}, []);

	const handleStandardSubstanceUnitChange = useCallback((unit: Unit) => {
		setStandardSubstanceUnit(unit);

		if (requiredSubstanceUnit === undefined) {
			setRequiredSubstanceUnit(unit);
		}
	}, [requiredSubstanceUnit]);

	const handleStandardMediumVolumeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		setStandardMediumVolume(event.target.value);
	}, []);

	const handleStandardMediumUnitChange = useCallback((unit: Unit) => {
		setStandardMediumUnit(unit);
	}, []);

	const handleTargetVolumeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		setTargetVolume(event.target.value);
	}, []);

	const handleTargetUnitChange = useCallback((unit: Unit) => {
		setTargetUnit(unit);
	}, []);

	const handleRequiredSubstanceUnitChange = useCallback((unit: Unit) => {
		setRequiredSubstanceUnit(unit);
	}, []);

	const handleRecordLabelChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		setRecordLabel(event.target.value);
	}, []);

	const requiredSubstance = useMemo(() => {
		if (standardSubstanceVolume === undefined || standardSubstanceUnit === undefined || standardMediumVolume === undefined || standardMediumUnit === undefined || targetVolume === undefined || targetUnit === undefined || requiredSubstanceUnit === undefined) {
			return;
		}

		const standardSubstanceBase = convertToBase(parseFloat(standardSubstanceVolume), standardSubstanceUnit);
		const standardMediumBase = convertToBase(parseFloat(standardMediumVolume), standardMediumUnit);
		const targetBase = convertToBase(parseFloat(targetVolume), targetUnit);

		const requiredSubstanceBase = (standardSubstanceBase / standardMediumBase) * targetBase;

		return convertFromBase(requiredSubstanceBase, requiredSubstanceUnit);
	}, [standardSubstanceVolume, standardSubstanceUnit, standardMediumVolume, standardMediumUnit, targetVolume, targetUnit, requiredSubstanceUnit]);

	const handleSaveRecord = useCallback(() => {
		const records = JSON.parse(localStorage.getItem('records') || '[]');

		records.push({
			standardSubstanceVolume,
			standardSubstanceUnit,
			standardMediumVolume,
			standardMediumUnit,
			targetVolume,
			targetUnit,
			requiredSubstanceUnit,
			requiredSubstance,
			recordLabel,
		});

		setRecords(records);

		localStorage.setItem('records', JSON.stringify(records));

		toast('Record saved');
	}, [recordLabel, requiredSubstance, requiredSubstanceUnit, standardMediumUnit, standardMediumVolume, standardSubstanceUnit, standardSubstanceVolume, targetUnit, targetVolume]);

	const handleOptimise = useCallback(() => {
		if (requiredSubstance !== undefined && requiredSubstance < 1 && requiredSubstanceUnit === 'l') {
			setRequiredSubstanceUnit('ml');
			toast('Converted to milliliters');
		}

		if (requiredSubstance !== undefined && requiredSubstance >= 1000 && requiredSubstanceUnit === 'ml') {
			setRequiredSubstanceUnit('l');
			toast('Converted to liters');
		}
	}, [requiredSubstance, requiredSubstanceUnit]);

	const handleLoadRecord = useCallback((record: SavedRecord) => {
		setStandardSubstanceVolume(record.standardSubstanceVolume);
		setStandardSubstanceUnit(record.standardSubstanceUnit);
		setStandardMediumVolume(record.standardMediumVolume);
		setStandardMediumUnit(record.standardMediumUnit);
		setTargetVolume(record.targetVolume);
		setTargetUnit(record.targetUnit);
		setRequiredSubstanceUnit(record.requiredSubstanceUnit);
		setRecordLabel(record.recordLabel);
		setRecordsOpen(false);
	}, []);

	const handleDeleteRecord = useCallback((record: SavedRecord) => {
		const records = JSON.parse(localStorage.getItem('records') || '[]');

		const index = records.find((r: SavedRecord) => r === record);

		if (index !== -1) {
			records.splice(index, 1);

			setRecords(records);

			localStorage.setItem('records', JSON.stringify(records));

			toast('Record deleted');
		}
	}, []);

	const hasValidRecord = useMemo(() => {
		return requiredSubstance !== undefined && isNumber(requiredSubstance) && isUnit(requiredSubstanceUnit) && recordLabel !== undefined && recordLabel.length > 0;
	}, [recordLabel, requiredSubstance, requiredSubstanceUnit]);

	return (
		<div className="bg-neutral-950 text-neutral-50 h-auto md:h-screen flex items-center justify-center p-6">
			<div className="flex flex-col w-full max-w-sm">
				<div className="p-4 border border-neutral-800 rounded-lg">
					<h2 className="text-lg">Standard rate</h2>
					<div className="mt-4 flex flex-col w-full items-stretch gap-2">
						<div className="flex items-center gap-2">
							<Input placeholder="Substance" value={standardSubstanceVolume} onChange={handleStandardSubstanceVolumeChange}/>
							<Select value={standardSubstanceUnit} onValueChange={handleStandardSubstanceUnitChange}>
								<SelectTrigger>
									<SelectValue placeholder="Unit"/>
								</SelectTrigger>
								<SelectContent>
									{units.map((unit) => (
										<SelectItem key={unit} value={unit}>{unitLabels[unit]}</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="flex items-center gap-2">
							<Input placeholder="Medium" value={standardMediumVolume} onChange={handleStandardMediumVolumeChange}/>
							<Select value={standardMediumUnit} onValueChange={handleStandardMediumUnitChange}>
								<SelectTrigger>
									<SelectValue placeholder="Unit"/>
								</SelectTrigger>
								<SelectContent>
									{units.map((unit) => (
										<SelectItem key={unit} value={unit}>{unitLabels[unit]}</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</div>
				<div className="mt-6 p-4 border border-neutral-800 rounded-lg">
					<h2 className="text-lg">Target</h2>
					<div className="mt-2 flex items-stretch gap-2">
						<Input placeholder="Medium" value={targetVolume} onChange={handleTargetVolumeChange}/>
						<Select value={targetUnit} onValueChange={handleTargetUnitChange}>
							<SelectTrigger>
								<SelectValue placeholder="Unit"/>
							</SelectTrigger>
							<SelectContent>
								{units.map((unit) => (
									<SelectItem key={unit} value={unit}>{unitLabels[unit]}</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
				<div className="mt-6 p-4 border border-neutral-800 rounded-lg">
					<h2 className="text-lg">Required substance</h2>
					<div className="mt-4 flex items-center text-6xl">
						<span className="font-black text-neutral-50">{isNumber(requiredSubstance) ? formatNumber(requiredSubstance) : 'XXX'}</span>
						<span className="font-light ml-1 text-neutral-600">{isUnit(requiredSubstanceUnit) ? requiredSubstanceUnit : 'xx'}</span>
					</div>
					<div className="flex items-center mt-4 gap-2">
						<Select value={requiredSubstanceUnit} onValueChange={handleRequiredSubstanceUnitChange}>
							<SelectTrigger className="basis-2/3">
								<SelectValue placeholder="Unit"/>
							</SelectTrigger>
							<SelectContent>
								{units.map((unit) => (
									<SelectItem key={unit} value={unit}>{unitLabels[unit]}</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Button className="basis-1/3" variant="outline" onClick={handleOptimise}>Optimise</Button>
					</div>
				</div>
				<div className="mt-6 p-4 border border-neutral-800 rounded-lg">
					<h2 className="text-lg">Actions</h2>
					<Input className="mt-2" placeholder="Record label" value={recordLabel} onChange={handleRecordLabelChange}/>
					<div className="mt-2 basis-1/2 flex items-stretch gap-2">
						<Button className="basis-1/2" variant="default" onClick={handleSaveRecord} disabled={!hasValidRecord}>Save record</Button>
						<Sheet open={recordsOpen} onOpenChange={setRecordsOpen}>
							<SheetTrigger asChild>
								<Button className="basis-1/2" variant="secondary">View records</Button>
							</SheetTrigger>
							<SheetContent className="text-neutral-50 overflow-y-auto">
								<SheetHeader>
									<SheetTitle>Records</SheetTitle>
									<SheetDescription>
										View a list of all local saved records
									</SheetDescription>
								</SheetHeader>
								<div className="mt-8">
									{records.length === 0 && (
										<div className="text-center text-neutral-300">No records saved</div>
									)}
									{records.map((record, index) => (
										<div key={index} className="p-4 border border-neutral-800 rounded-lg mt-2">
											<div className="flex items-center text-4xl">
												<span className="font-black text-neutral-50">{record.requiredSubstance}</span>
												<span className="font-light ml-1 text-neutral-600">{record.requiredSubstanceUnit}</span>
											</div>
											<span className="block mt-1 font-semibold text-base text-neutral-300">{record.recordLabel}</span>
											<div className="mt-3 flex items-center gap-1 text-neutral-500 text-sm">
												<span className="font-bold">Standard rate:</span>
												<span>{record.standardSubstanceVolume}{record.standardSubstanceUnit} / {record.standardMediumVolume}{record.standardMediumUnit}</span>
											</div>
											<div className="flex items-center gap-1 text-neutral-500 text-sm">
												<span className="font-bold">Target:</span>
												<span>{record.targetVolume}{record.targetUnit}</span>
											</div>
											<div className="mt-3 flex gap-2">
												<Button className="mt-2 basis-2/3" variant="default" onClick={() => handleLoadRecord(record)}>Load</Button>
												<Button className="mt-2 basis-1/3" variant="destructive" onClick={() => handleDeleteRecord(record)}>Delete</Button>
											</div>
										</div>
									))}
								</div>
							</SheetContent>
						</Sheet>
					</div>
				</div>
			</div>
		</div>
	)
};
